import prisma from '../../prisma.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import type { User } from '@prisma/client';

let botInstance: { api: { getChatMember: (chatId: string, userId: number) => Promise<{ status: string }> } } | null = null;

export function setBotInstance(bot: typeof botInstance) {
  botInstance = bot;
}

export async function getTasks(user: User) {
  const tasks = await prisma.task.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  const completions = await prisma.taskCompletion.findMany({
    where: { userId: user.id },
    select: { taskId: true },
  });

  const completedIds = new Set(completions.map((c) => c.taskId));

  const referralCount = await prisma.user.count({
    where: { referredById: user.id },
  });

  const mainTasks = tasks
    .filter((t) => t.category === 'MAIN')
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type,
      rewardCoins: t.rewardCoins,
      completed: completedIds.has(t.id),
      progress:
        t.type === 'INVITE_FRIENDS'
          ? { required: t.requiredInvites ?? 0, current: referralCount }
          : undefined,
    }));

  const otherTasks = tasks
    .filter((t) => t.category === 'OTHER')
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type,
      rewardCoins: t.rewardCoins,
      completed: completedIds.has(t.id),
      progress:
        t.type === 'INVITE_FRIENDS'
          ? { required: t.requiredInvites ?? 0, current: referralCount }
          : undefined,
    }));

  return { main: mainTasks, other: otherTasks };
}

export async function checkTask(user: User, taskId: number) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || !task.isActive) {
    throw new NotFoundError('Task not found');
  }

  const existing = await prisma.taskCompletion.findUnique({
    where: { userId_taskId: { userId: user.id, taskId } },
  });

  if (existing) {
    return { completed: true, reward: task.rewardCoins };
  }

  if (task.type === 'CHANNEL_JOIN') {
    if (!task.channelUsername) {
      throw new BadRequestError('Task is misconfigured');
    }

    if (!botInstance) {
      throw new BadRequestError('Bot not available for verification');
    }

    try {
      const member = await botInstance.api.getChatMember(
        task.channelUsername,
        parseInt(user.telegramId, 10),
      );

      if (!['member', 'administrator', 'creator'].includes(member.status)) {
        return { completed: false, error: 'Not yet joined the channel' };
      }
    } catch {
      return { completed: false, error: 'Could not verify channel membership' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.taskCompletion.create({
        data: { userId: user.id, taskId },
      });

      await tx.userSubscription.upsert({
        where: {
          userId_channelUsername: { userId: user.id, channelUsername: task.channelUsername! },
        },
        create: { userId: user.id, channelUsername: task.channelUsername! },
        update: {},
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: task.rewardCoins },
          totalCoinsEarned: { increment: task.rewardCoins },
        },
      });

      await tx.action.create({
        data: {
          userId: user.id,
          type: 'TASK_COMPLETED',
          data: JSON.stringify({ taskId, type: 'CHANNEL_JOIN', reward: task.rewardCoins }),
        },
      });
    });

    return { completed: true, reward: task.rewardCoins };
  }

  if (task.type === 'INVITE_FRIENDS') {
    const referralCount = await prisma.user.count({
      where: { referredById: user.id },
    });

    if (referralCount < (task.requiredInvites ?? 0)) {
      return {
        completed: false,
        error: `Need ${task.requiredInvites! - referralCount} more invites`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.taskCompletion.create({
        data: { userId: user.id, taskId },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: task.rewardCoins },
          totalCoinsEarned: { increment: task.rewardCoins },
        },
      });

      await tx.action.create({
        data: {
          userId: user.id,
          type: 'TASK_COMPLETED',
          data: JSON.stringify({ taskId, type: 'INVITE_FRIENDS', reward: task.rewardCoins }),
        },
      });
    });

    return { completed: true, reward: task.rewardCoins };
  }

  throw new BadRequestError('Unknown task type');
}
