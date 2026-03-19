import prisma from '../../../prisma.js';
import { getSettings } from '../../../plugins/settings.js';
import { InsufficientBalanceError, ConflictError } from '../../../lib/errors.js';
import type { User, BoosterType } from '@prisma/client';

interface BoosterPriceConfig {
  stars: number;
  durationMinutes?: number;
  durationHours?: number;
}

export async function getBoosters(user: User) {
  const settings = await getSettings();
  const prices = settings.boosterPrices as unknown as Record<string, BoosterPriceConfig>;
  const now = new Date();

  const activeBoosters = await prisma.activeBooster.findMany({
    where: { userId: user.id, expiresAt: { gt: now } },
  });

  const boosterList = [
    {
      type: 'MINING_BOOST_1_5X' as const,
      name: 'Mining Boost 1.5x',
      description: 'Multiplies mining rate by 1.5',
      priceStars: prices.MINING_BOOST_1_5X?.stars ?? 10,
      durationMinutes: prices.MINING_BOOST_1_5X?.durationMinutes ?? 60,
      isActive: activeBoosters.some((b) => b.type === 'MINING_BOOST_1_5X'),
      expiresAt: activeBoosters.find((b) => b.type === 'MINING_BOOST_1_5X')?.expiresAt?.toISOString(),
    },
    {
      type: 'AUTO_MINING' as const,
      name: 'Auto Mining',
      description: 'Automatically restarts fishing after collection',
      priceStars: prices.AUTO_MINING?.stars ?? 20,
      durationMinutes: (prices.AUTO_MINING?.durationHours ?? 24) * 60,
      isActive: activeBoosters.some((b) => b.type === 'AUTO_MINING'),
      expiresAt: activeBoosters.find((b) => b.type === 'AUTO_MINING')?.expiresAt?.toISOString(),
    },
  ];

  return { boosters: boosterList };
}

export async function purchaseBooster(user: User, boosterType: BoosterType) {
  const settings = await getSettings();
  const prices = settings.boosterPrices as unknown as Record<string, BoosterPriceConfig>;
  const config = prices[boosterType];

  if (!config) {
    throw new Error('Booster type not configured');
  }

  if (user.starsBalance < config.stars) {
    throw new InsufficientBalanceError('Not enough stars');
  }

  const now = new Date();

  if (boosterType === 'MINING_BOOST_1_5X') {
    const existing = await prisma.activeBooster.findFirst({
      where: { userId: user.id, type: boosterType, expiresAt: { gt: now } },
    });
    if (existing) {
      throw new ConflictError('Mining boost already active');
    }
  }

  let durationMs: number;
  if (boosterType === 'MINING_BOOST_1_5X') {
    durationMs = (config.durationMinutes ?? 60) * 60 * 1000;
  } else {
    durationMs = (config.durationHours ?? 24) * 60 * 60 * 1000;
  }

  const expiresAt = new Date(now.getTime() + durationMs);

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { starsBalance: { decrement: config.stars } },
    });

    await tx.starsTransaction.create({
      data: {
        userId: user.id,
        amount: -config.stars,
        source: 'booster_purchase',
        comment: `Purchased ${boosterType}`,
      },
    });

    const booster = await tx.activeBooster.create({
      data: {
        userId: user.id,
        type: boosterType,
        multiplier: boosterType === 'MINING_BOOST_1_5X' ? 1.5 : 1.0,
        expiresAt,
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'BOOSTER_ACTIVATED',
        data: JSON.stringify({ boosterType, expiresAt }),
      },
    });

    return {
      booster: {
        type: booster.type,
        activatedAt: booster.activatedAt.toISOString(),
        expiresAt: booster.expiresAt.toISOString(),
      },
      starsBalance: user.starsBalance - config.stars,
    };
  });

  return result;
}
