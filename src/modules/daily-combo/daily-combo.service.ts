import prisma from '../../prisma.js';
import { getSettings } from '../../plugins/settings.js';
import { evaluateComboAnswer, getComboReward } from './daily-combo.engine.js';
import { BadRequestError } from '../../lib/errors.js';
import type { User } from '@prisma/client';

const COMBO_ITEMS = [
  { id: 1, name: 'Fishing hat' },
  { id: 2, name: 'Fishing rod' },
  { id: 3, name: 'Fish' },
  { id: 4, name: 'Fishing bucket' },
  { id: 5, name: 'Fishing boots' },
  { id: 6, name: 'Fishing boat' },
  { id: 7, name: 'Fishing bag' },
  { id: 8, name: 'Fishing net' },
];

function getToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getNextReset(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.toISOString();
}

export async function getTodayCombo(user: User) {
  const today = getToday();

  const alreadyAttempted = user.lastComboDate
    ? user.lastComboDate.getTime() === today.getTime()
    : false;

  return {
    items: COMBO_ITEMS,
    alreadyAttempted,
    lastResult: alreadyAttempted
      ? { correctCount: user.lastComboResult ?? 0, reward: 0 }
      : undefined,
    resetsAt: getNextReset(),
  };
}

export async function submitCombo(user: User, items: number[]) {
  const today = getToday();

  if (user.lastComboDate && user.lastComboDate.getTime() === today.getTime()) {
    throw new BadRequestError('Already attempted today');
  }

  const combo = await prisma.dailyCombo.findUnique({ where: { date: today } });
  if (!combo) {
    throw new BadRequestError('No combo set for today');
  }

  const correctItems = combo.correctItems as number[];
  const { correctCount } = evaluateComboAnswer(items, correctItems);

  const settings = await getSettings();
  const rewardMap = settings.comboRewards as Record<string, number>;
  const reward = getComboReward(correctCount, rewardMap);

  await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {
      lastComboDate: today,
      lastComboResult: correctCount,
    };

    if (reward > 0) {
      updateData.coins = { increment: reward };
      updateData.totalCoinsEarned = { increment: reward };
    }

    await tx.user.update({ where: { id: user.id }, data: updateData });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'DAILY_COMBO_SUBMITTED',
        data: JSON.stringify({ items, correctCount, reward }),
      },
    });
  });

  return { correctCount, reward, correctAnswer: correctItems };
}
