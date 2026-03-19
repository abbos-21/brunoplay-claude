import prisma from '../../prisma.js';

export async function getOverview() {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsersToday,
    activeUsersWeek,
    newUsersToday,
    newUsersWeek,
    coinsAgg,
    withdrawalsCompleted,
    starsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: todayStart } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.aggregate({ _sum: { coins: true, totalCoinsEarned: true } }),
    prisma.withdrawal.aggregate({
      where: { status: 'COMPLETED' },
      _count: true,
      _sum: { amountTon: true },
    }),
    prisma.user.aggregate({ _sum: { starsBalance: true } }),
  ]);

  return {
    totalUsers,
    activeUsersToday,
    activeUsersWeek,
    newUsersToday,
    newUsersWeek,
    totalCoinsInCirculation: coinsAgg._sum.coins ?? 0,
    totalCoinsEverEarned: coinsAgg._sum.totalCoinsEarned ?? 0,
    totalWithdrawalsCompleted: withdrawalsCompleted._count,
    totalWithdrawalsTon: withdrawalsCompleted._sum.amountTon ?? 0,
    totalStarsInCirculation: starsAgg._sum.starsBalance ?? 0,
  };
}

export async function getRegistrations(period: string, from?: string, to?: string) {
  const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = to ? new Date(to) : new Date();

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const grouped = new Map<string, number>();
  for (const user of users) {
    const key = user.createdAt.toISOString().split('T')[0];
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return { data: Array.from(grouped, ([date, count]) => ({ date, count })) };
}

export async function getEconomyAnalytics(period: string) {
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const actions = await prisma.action.findMany({
    where: {
      time: { gte: startDate },
      type: {
        in: [
          'FISHING_COLLECT',
          'TASK_COMPLETED',
          'REFERRAL_REWARD',
          'DAILY_COMBO_SUBMITTED',
          'DAILY_LOGIN_CLAIMED',
          'WITHDRAWAL_COMPLETED',
        ],
      },
    },
    select: { type: true, time: true, data: true },
    orderBy: { time: 'asc' },
  });

  const grouped = new Map<string, Record<string, number>>();

  for (const action of actions) {
    const date = action.time.toISOString().split('T')[0];
    if (!grouped.has(date)) {
      grouped.set(date, {
        coinsEarned: 0,
        coinsWithdrawn: 0,
        coinsFromFishing: 0,
        coinsFromTasks: 0,
        coinsFromReferrals: 0,
        coinsFromCombo: 0,
        coinsFromDailyLogin: 0,
      });
    }
    const day = grouped.get(date)!;
    const data = JSON.parse(action.data);

    switch (action.type) {
      case 'FISHING_COLLECT':
        day.coinsFromFishing += data.coinsCollected ?? 0;
        day.coinsEarned += data.coinsCollected ?? 0;
        break;
      case 'TASK_COMPLETED':
        day.coinsFromTasks += data.reward ?? 0;
        day.coinsEarned += data.reward ?? 0;
        break;
      case 'REFERRAL_REWARD':
        day.coinsFromReferrals += data.reward ?? 0;
        day.coinsEarned += data.reward ?? 0;
        break;
      case 'DAILY_COMBO_SUBMITTED':
        day.coinsFromCombo += data.reward ?? 0;
        day.coinsEarned += data.reward ?? 0;
        break;
      case 'DAILY_LOGIN_CLAIMED':
        day.coinsFromDailyLogin += data.reward ?? 0;
        day.coinsEarned += data.reward ?? 0;
        break;
      case 'WITHDRAWAL_COMPLETED':
        day.coinsWithdrawn += data.amountCoins ?? 0;
        break;
    }
  }

  return {
    data: Array.from(grouped, ([date, stats]) => ({
      date,
      ...stats,
      netFlow: stats.coinsEarned - stats.coinsWithdrawn,
    })),
  };
}

export async function getGamesAnalytics() {
  const [spinStats, rouletteStats, rideStats, totalStarsRevenue] = await Promise.all([
    prisma.spinSession.aggregate({ _count: true, _sum: { costStars: true } }),
    prisma.rouletteSession.aggregate({ _count: true, _sum: { costStars: true } }),
    prisma.rideSession.aggregate({
      _count: true,
      _sum: { costStars: true },
    }),
    prisma.starsTransaction.aggregate({
      where: { amount: { lt: 0 } },
      _sum: { amount: true },
    }),
  ]);

  const cheatersDetected = await prisma.rideSession.count({ where: { status: 'FLAGGED_CHEAT' } });

  return {
    spin: {
      totalPlayed: spinStats._count,
      totalStarsSpent: spinStats._sum.costStars ?? 0,
    },
    roulette: {
      totalPlayed: rouletteStats._count,
      totalStarsSpent: rouletteStats._sum.costStars ?? 0,
    },
    brunosRide: {
      totalPlayed: rideStats._count,
      totalStarsSpent: rideStats._sum.costStars ?? 0,
      cheatersDetected,
    },
    totalStarsRevenue: Math.abs(totalStarsRevenue._sum.amount ?? 0),
  };
}

export async function getReferralAnalytics() {
  const totalReferrals = await prisma.user.count({ where: { referredById: { not: null } } });

  const totalReferralRewardsPaid = await prisma.user.aggregate({
    _sum: { referralEarnings: true },
  });

  const topReferrers = await prisma.user.findMany({
    where: { referralEarnings: { gt: 0 } },
    select: {
      id: true,
      username: true,
      referralEarnings: true,
      _count: { select: { referrals: true } },
    },
    orderBy: { referralEarnings: 'desc' },
    take: 20,
  });

  return {
    totalReferrals,
    totalReferralRewardsPaid: totalReferralRewardsPaid._sum.referralEarnings ?? 0,
    topReferrers: topReferrers.map((r) => ({
      userId: r.id,
      username: r.username,
      referralCount: r._count.referrals,
      totalEarnings: r.referralEarnings,
    })),
  };
}
