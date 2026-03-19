import prisma from '../prisma.js';
import { getSettings } from '../plugins/settings.js';
import type { PrismaClient, Prisma } from '@prisma/client';

export async function processReferralRewards(
  userId: number,
  newLevel: number,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { referredById: true, rewardedLevels: true },
  });

  if (!user?.referredById) return;

  const rewardedLevels: number[] = JSON.parse(user.rewardedLevels);
  const settings = await getSettings();
  const referralRewards = settings.referralRewards as Record<string, number>;

  let totalReward = 0;
  const newRewardedLevels = [...rewardedLevels];

  for (let level = 2; level <= newLevel; level++) {
    if (rewardedLevels.includes(level)) continue;
    const reward = referralRewards[String(level)];
    if (reward) {
      totalReward += reward;
      newRewardedLevels.push(level);
    }
  }

  if (totalReward === 0) return;

  await tx.user.update({
    where: { id: userId },
    data: { rewardedLevels: JSON.stringify(newRewardedLevels) },
  });

  await tx.user.update({
    where: { id: user.referredById },
    data: {
      coins: { increment: totalReward },
      totalCoinsEarned: { increment: totalReward },
      referralEarnings: { increment: totalReward },
    },
  });

  await tx.action.create({
    data: {
      userId: user.referredById,
      type: 'REFERRAL_REWARD',
      data: JSON.stringify({
        referredUserId: userId,
        level: newLevel,
        reward: totalReward,
      }),
    },
  });
}
