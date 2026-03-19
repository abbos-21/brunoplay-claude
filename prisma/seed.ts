import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Settings singleton
  await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      fishingDurationSeconds: 3600,
      cardUpgradeValues: {
        coinCapacity: [100, 200, 350, 500, 750, 1000, 1400, 1800, 2300, 3000, 3800, 4800, 6000],
        miningRate: [0.0278, 0.0556, 0.0972, 0.1389, 0.2083, 0.2778, 0.3889, 0.5, 0.6389, 0.8333, 1.0556, 1.3333, 1.6667],
      },
      boosterPrices: {
        MINING_BOOST_1_5X: { stars: 10, durationMinutes: 60 },
        AUTO_MINING: { stars: 20, durationHours: 24 },
      },
      spinTiers: [
        {
          tier: 'TIER_1',
          costStars: 1,
          prizes: [
            { name: '10 Coins', type: 'coins', value: 10, weight: 0.30 },
            { name: '25 Coins', type: 'coins', value: 25, weight: 0.25 },
            { name: '50 Coins', type: 'coins', value: 50, weight: 0.20 },
            { name: '5 Stars', type: 'stars', value: 5, weight: 0.15 },
            { name: '100 Coins', type: 'coins', value: 100, weight: 0.08 },
            { name: 'Gift', type: 'gift', value: 'small_gift', weight: 0.02 },
          ],
        },
        {
          tier: 'TIER_2',
          costStars: 3,
          prizes: [
            { name: '50 Coins', type: 'coins', value: 50, weight: 0.30 },
            { name: '100 Coins', type: 'coins', value: 100, weight: 0.25 },
            { name: '200 Coins', type: 'coins', value: 200, weight: 0.20 },
            { name: '10 Stars', type: 'stars', value: 10, weight: 0.15 },
            { name: '500 Coins', type: 'coins', value: 500, weight: 0.08 },
            { name: 'Gift', type: 'gift', value: 'medium_gift', weight: 0.02 },
          ],
        },
        {
          tier: 'TIER_3',
          costStars: 5,
          prizes: [
            { name: '100 Coins', type: 'coins', value: 100, weight: 0.30 },
            { name: '250 Coins', type: 'coins', value: 250, weight: 0.25 },
            { name: '500 Coins', type: 'coins', value: 500, weight: 0.20 },
            { name: '25 Stars', type: 'stars', value: 25, weight: 0.15 },
            { name: '1000 Coins', type: 'coins', value: 1000, weight: 0.08 },
            { name: 'Gift', type: 'gift', value: 'large_gift', weight: 0.02 },
          ],
        },
        {
          tier: 'TIER_4',
          costStars: 10,
          prizes: [
            { name: '500 Coins', type: 'coins', value: 500, weight: 0.30 },
            { name: '1000 Coins', type: 'coins', value: 1000, weight: 0.25 },
            { name: '2000 Coins', type: 'coins', value: 2000, weight: 0.20 },
            { name: '50 Stars', type: 'stars', value: 50, weight: 0.15 },
            { name: '5000 Coins', type: 'coins', value: 5000, weight: 0.08 },
            { name: 'Gift', type: 'gift', value: 'premium_gift', weight: 0.02 },
          ],
        },
        {
          tier: 'TIER_5',
          costStars: 25,
          prizes: [
            { name: '2000 Coins', type: 'coins', value: 2000, weight: 0.30 },
            { name: '5000 Coins', type: 'coins', value: 5000, weight: 0.25 },
            { name: '10000 Coins', type: 'coins', value: 10000, weight: 0.20 },
            { name: '100 Stars', type: 'stars', value: 100, weight: 0.15 },
            { name: '25000 Coins', type: 'coins', value: 25000, weight: 0.08 },
            { name: 'Gift', type: 'gift', value: 'legendary_gift', weight: 0.02 },
          ],
        },
      ],
      rouletteCostStars: 5,
      roulettePrizes: [
        { name: '50 Coins', type: 'coins', value: 50, weight: 0.30 },
        { name: '100 Coins', type: 'coins', value: 100, weight: 0.25 },
        { name: '250 Coins', type: 'coins', value: 250, weight: 0.20 },
        { name: '10 Stars', type: 'stars', value: 10, weight: 0.15 },
        { name: '500 Coins', type: 'coins', value: 500, weight: 0.08 },
        { name: 'Gift', type: 'gift', value: 'roulette_gift', weight: 0.02 },
      ],
      rideCostStars: 1,
      rideMaxCoinsPerSecond: 8,
      comboRewards: { '4': 100, '3': 75, '2': 50, '1': 25 },
      loginStreakRewards: {
        '1': 5, '2': 10, '3': 15, '4': 25, '5': 35,
        '6': 50, '7': 65, '8': 80, '9': 100, '10': 150,
      },
      coinToTonRate: 100000,
      minimumCoinWithdrawal: 100000,
      maximumCoinWithdrawal: 1000000,
      withdrawalFeeTon: 0.05,
      referralRewards: {
        '2': 200, '3': 500, '4': 2000, '5': 5000, '6': 10000,
        '7': 20000, '8': 50000, '9': 100000, '10': 250000,
        '11': 500000, '12': 1000000, '13': 1050000,
      },
      tonToStarsRate: 1.0,
      tonToStarsBonusPercent: 10,
    },
    update: {},
  });

  console.log('✅ Settings created');

  // 2. Super Admin
  const adminPassword = await bcrypt.hash('changeme', 12);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
    update: {},
  });

  console.log('✅ Super admin created (username: admin, password: changeme)');

  // 3. Default card upgrade requirements
  const cardRequirements = [
    // Level 1 is default, no requirements
    { cardName: 'COIN_CAPACITY' as const, level: 2, description: 'Reach level 1', requirementType: 'level', requirementValue: '1' },
    { cardName: 'COIN_CAPACITY' as const, level: 3, description: 'Reach level 2', requirementType: 'level', requirementValue: '2' },
    { cardName: 'COIN_CAPACITY' as const, level: 4, description: 'Reach level 3', requirementType: 'level', requirementValue: '3' },
    { cardName: 'COIN_CAPACITY' as const, level: 5, description: 'Reach level 4', requirementType: 'level', requirementValue: '4' },
    { cardName: 'COIN_CAPACITY' as const, level: 6, description: 'Reach level 5', requirementType: 'level', requirementValue: '5' },
    { cardName: 'COIN_CAPACITY' as const, level: 7, description: 'Reach level 6', requirementType: 'level', requirementValue: '6' },
    { cardName: 'COIN_CAPACITY' as const, level: 8, description: 'Reach level 7', requirementType: 'level', requirementValue: '7' },
    { cardName: 'COIN_CAPACITY' as const, level: 9, description: 'Reach level 8', requirementType: 'level', requirementValue: '8' },
    { cardName: 'COIN_CAPACITY' as const, level: 10, description: 'Reach level 9', requirementType: 'level', requirementValue: '9' },
    { cardName: 'COIN_CAPACITY' as const, level: 11, description: 'Reach level 10', requirementType: 'level', requirementValue: '10' },
    { cardName: 'COIN_CAPACITY' as const, level: 12, description: 'Reach level 11', requirementType: 'level', requirementValue: '11' },
    { cardName: 'COIN_CAPACITY' as const, level: 13, description: 'Reach level 12', requirementType: 'level', requirementValue: '12' },
    { cardName: 'MINING_RATE' as const, level: 2, description: 'Reach level 1', requirementType: 'level', requirementValue: '1' },
    { cardName: 'MINING_RATE' as const, level: 3, description: 'Reach level 2', requirementType: 'level', requirementValue: '2' },
    { cardName: 'MINING_RATE' as const, level: 4, description: 'Reach level 3', requirementType: 'level', requirementValue: '3' },
    { cardName: 'MINING_RATE' as const, level: 5, description: 'Reach level 4', requirementType: 'level', requirementValue: '4' },
    { cardName: 'MINING_RATE' as const, level: 6, description: 'Reach level 5', requirementType: 'level', requirementValue: '5' },
    { cardName: 'MINING_RATE' as const, level: 7, description: 'Reach level 6', requirementType: 'level', requirementValue: '6' },
    { cardName: 'MINING_RATE' as const, level: 8, description: 'Reach level 7', requirementType: 'level', requirementValue: '7' },
    { cardName: 'MINING_RATE' as const, level: 9, description: 'Reach level 8', requirementType: 'level', requirementValue: '8' },
    { cardName: 'MINING_RATE' as const, level: 10, description: 'Reach level 9', requirementType: 'level', requirementValue: '9' },
    { cardName: 'MINING_RATE' as const, level: 11, description: 'Reach level 10', requirementType: 'level', requirementValue: '10' },
    { cardName: 'MINING_RATE' as const, level: 12, description: 'Reach level 11', requirementType: 'level', requirementValue: '11' },
    { cardName: 'MINING_RATE' as const, level: 13, description: 'Reach level 12', requirementType: 'level', requirementValue: '12' },
  ];

  for (const req of cardRequirements) {
    await prisma.cardUpgradeRequirement.upsert({
      where: { cardName_level: { cardName: req.cardName, level: req.level } },
      create: req,
      update: {},
    });
  }

  console.log('✅ Card upgrade requirements created');

  // 4. Sample tasks
  const tasks = [
    { category: 'MAIN' as const, type: 'CHANNEL_JOIN' as const, title: 'Join our Telegram channel', channelUsername: '@brunosfishing', rewardCoins: 100, sortOrder: 1 },
    { category: 'MAIN' as const, type: 'INVITE_FRIENDS' as const, title: 'Invite 5 friends', requiredInvites: 5, rewardCoins: 500, sortOrder: 2 },
    { category: 'MAIN' as const, type: 'INVITE_FRIENDS' as const, title: 'Invite 10 friends', requiredInvites: 10, rewardCoins: 1500, sortOrder: 3 },
    { category: 'OTHER' as const, type: 'CHANNEL_JOIN' as const, title: 'Join partner channel', channelUsername: '@partnerchannel', rewardCoins: 50, sortOrder: 1 },
  ];

  for (const task of tasks) {
    const existing = await prisma.task.findFirst({ where: { title: task.title } });
    if (!existing) {
      await prisma.task.create({ data: task });
    }
  }

  console.log('✅ Sample tasks created');

  // 5. Today's daily combo
  const today = new Date();
  const todayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const randomItems = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 4);

  await prisma.dailyCombo.upsert({
    where: { date: todayDate },
    create: { date: todayDate, correctItems: randomItems },
    update: {},
  });

  console.log(`✅ Today's daily combo set: [${randomItems.join(', ')}]`);

  // 6. Sample tournament
  const tournamentStart = new Date();
  const tournamentEnd = new Date(tournamentStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const existingTournament = await prisma.tournament.findFirst({ where: { name: 'Weekly Championship' } });
  if (!existingTournament) {
    await prisma.tournament.create({
      data: {
        name: 'Weekly Championship',
        description: 'Compete to be the top spender this week!',
        startAt: tournamentStart,
        endAt: tournamentEnd,
        rewards: { '1': 50000, '2': 25000, '3': 10000 },
      },
    });
  }

  console.log('✅ Sample tournament created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
