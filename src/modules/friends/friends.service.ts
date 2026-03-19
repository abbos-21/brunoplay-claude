import prisma from '../../prisma.js';
import { env } from '../../config/env.js';
import { getSettings } from '../../plugins/settings.js';
import type { User } from '@prisma/client';

export function getInviteLink(user: User) {
  return {
    inviteLink: `https://t.me/${env.BOT_USERNAME}?start=ref_${user.id}`,
  };
}

export async function getFriendsStats(user: User) {
  const totalReferrals = await prisma.user.count({
    where: { referredById: user.id },
  });

  return {
    totalReferrals,
    referralEarnings: user.referralEarnings,
  };
}

export async function getFriendsList(userId: number, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [friends, total] = await Promise.all([
    prisma.user.findMany({
      where: { referredById: userId },
      select: {
        telegramId: true,
        username: true,
        firstName: true,
        totalCoinsEarned: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { referredById: userId } }),
  ]);

  return {
    friends: friends.map((f) => ({
      telegramId: f.telegramId,
      username: f.username,
      firstName: f.firstName,
      coinsEarnedFromThem: f.totalCoinsEarned,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRewardDetails() {
  const settings = await getSettings();
  const referralRewards = settings.referralRewards as Record<string, number>;

  const rewards = Object.entries(referralRewards).map(([level, coins]) => ({
    level: parseInt(level, 10),
    coins,
  }));

  return { rewards };
}
