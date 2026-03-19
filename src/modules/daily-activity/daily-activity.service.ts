import prisma from '../../prisma.js';
import { getSettings } from '../../plugins/settings.js';
import { BadRequestError } from '../../lib/errors.js';
import type { User } from '@prisma/client';

function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getYesterdayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
}

function getNextResetUTC(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString();
}

function isSameDay(a: Date | null, b: Date): boolean {
  if (!a) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function getDailyActivityStatus(user: User) {
  const settings = await getSettings();
  const streakRewards = settings.loginStreakRewards as Record<string, number>;
  const today = getTodayUTC();
  const yesterday = getYesterdayUTC();

  const canClaim = !isSameDay(user.lastLoginDate, today);

  let nextStreak: number;
  if (isSameDay(user.lastLoginDate, yesterday)) {
    nextStreak = user.loginStreak + 1;
  } else if (isSameDay(user.lastLoginDate, today)) {
    nextStreak = user.loginStreak;
  } else {
    nextStreak = 1;
  }

  const rewardDay = ((nextStreak - 1) % 10) + 1;
  const todayReward = streakRewards[String(rewardDay)] ?? 0;

  const streakRewardsList = Array.from({ length: 10 }, (_, i) => {
    const day = i + 1;
    const currentRewardDay = ((user.loginStreak - 1) % 10) + 1;
    return {
      day,
      coins: streakRewards[String(day)] ?? 0,
      claimed: !canClaim && day <= currentRewardDay,
    };
  });

  return {
    currentStreak: user.loginStreak,
    canClaim,
    todayReward,
    streakRewards: streakRewardsList,
    resetsAt: getNextResetUTC(),
  };
}

export async function claimDailyActivity(user: User) {
  const today = getTodayUTC();
  const yesterday = getYesterdayUTC();

  if (isSameDay(user.lastLoginDate, today)) {
    throw new BadRequestError('Already claimed today');
  }

  let newStreak: number;
  if (isSameDay(user.lastLoginDate, yesterday)) {
    newStreak = user.loginStreak + 1;
  } else {
    newStreak = 1;
  }

  const rewardDay = ((newStreak - 1) % 10) + 1;

  const settings = await getSettings();
  const streakRewards = settings.loginStreakRewards as Record<string, number>;
  const reward = streakRewards[String(rewardDay)] ?? 0;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: user.id },
      data: {
        lastLoginDate: today,
        loginStreak: newStreak,
        coins: { increment: reward },
        totalCoinsEarned: { increment: reward },
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'DAILY_LOGIN_CLAIMED',
        data: JSON.stringify({ streak: newStreak, rewardDay, reward }),
      },
    });

    return {
      reward,
      newStreak,
      newBalance: updated.coins,
    };
  });

  return result;
}
