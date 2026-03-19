import prisma from '../../../prisma.js';
import { getSettings } from '../../../plugins/settings.js';
import { generateSpinResults, calculateTotalWon, type SpinPrize } from './spin.engine.js';
import { InsufficientBalanceError, BadRequestError } from '../../../lib/errors.js';
import type { User, SpinTier } from '@prisma/client';

interface SpinTierConfig {
  tier: string;
  costStars: number;
  prizes: SpinPrize[];
}

export async function getSpinTiers() {
  const settings = await getSettings();
  const tiers = settings.spinTiers as unknown as SpinTierConfig[];
  return { tiers };
}

export async function playSpin(user: User, tier: SpinTier, count: number) {
  const settings = await getSettings();
  const tiers = settings.spinTiers as unknown as SpinTierConfig[];
  const tierConfig = tiers.find((t) => t.tier === tier);

  if (!tierConfig) {
    throw new BadRequestError('Invalid spin tier');
  }

  const totalCost = tierConfig.costStars * count;

  if (user.starsBalance < totalCost) {
    throw new InsufficientBalanceError('Not enough stars');
  }

  const results = generateSpinResults(tierConfig.prizes, count);
  const totalWon = calculateTotalWon(results);

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        starsBalance: { decrement: totalCost },
        coins: { increment: totalWon.coins },
        totalCoinsEarned: { increment: totalWon.coins },
      },
    });

    if (totalWon.stars > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: { starsBalance: { increment: totalWon.stars } },
      });
    }

    await tx.starsTransaction.create({
      data: {
        userId: user.id,
        amount: -totalCost,
        source: 'spin_cost',
        comment: `Spin ${tier} x${count}`,
      },
    });

    await tx.spinSession.create({
      data: {
        userId: user.id,
        tier,
        costStars: totalCost,
        spinsCount: count,
        results: results as unknown as Parameters<typeof tx.spinSession.create>[0]['data']['results'],
        totalWon: totalWon as unknown as Parameters<typeof tx.spinSession.create>[0]['data']['totalWon'],
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'SPIN_PLAYED',
        data: JSON.stringify({ tier, count, totalCost, totalWon }),
      },
    });

    // Update tournament entry if active tournament
    const now = new Date();
    const activeTournament = await tx.tournament.findFirst({
      where: { isActive: true, startAt: { lte: now }, endAt: { gt: now } },
    });

    if (activeTournament) {
      await tx.tournamentEntry.upsert({
        where: {
          userId_tournamentId: { userId: user.id, tournamentId: activeTournament.id },
        },
        create: { userId: user.id, tournamentId: activeTournament.id, starsSpent: totalCost },
        update: { starsSpent: { increment: totalCost } },
      });
    }

    // Create LiveWin for significant wins
    for (const r of results) {
      if (
        (r.prizeType === 'coins' && Number(r.prizeValue) >= 50) ||
        r.prizeType === 'stars' ||
        r.prizeType === 'gift'
      ) {
        await tx.liveWin.create({
          data: {
            userId: user.id,
            username: user.username,
            firstName: user.firstName,
            gameType: 'spin',
            prizeName: r.prizeName,
            prizeValue: String(r.prizeValue),
            profitMultiplier: r.prizeType === 'coins' ? Number(r.prizeValue) / tierConfig.costStars : 1,
          },
        });
      }
    }

    return {
      results,
      totalWon,
      newStarsBalance: updatedUser.starsBalance - totalCost + totalWon.stars,
    };
  });

  return result;
}

export async function getSpinLiveWins() {
  const wins = await prisma.liveWin.findMany({
    where: { gameType: 'spin' },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return { wins };
}

export async function getSpinWinners(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [winners, total] = await Promise.all([
    prisma.liveWin.findMany({
      where: { gameType: 'spin' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.liveWin.count({ where: { gameType: 'spin' } }),
  ]);

  return { winners, total };
}

export async function getSpinPrizes(tier: SpinTier) {
  const settings = await getSettings();
  const tiers = settings.spinTiers as unknown as SpinTierConfig[];
  const tierConfig = tiers.find((t) => t.tier === tier);
  if (!tierConfig) {
    throw new BadRequestError('Invalid tier');
  }
  return { prizes: tierConfig.prizes };
}
