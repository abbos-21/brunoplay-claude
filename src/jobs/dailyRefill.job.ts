import prisma from '../prisma.js';

export async function runDailyRefill(): Promise<void> {
  const now = new Date();

  await prisma.jobState.upsert({
    where: { name: 'dailyRefill' },
    create: {
      name: 'dailyRefill',
      lastRunAt: now,
      nextRunAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
    update: {
      lastRunAt: now,
      nextRunAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  console.log('Daily refill job completed');
}
