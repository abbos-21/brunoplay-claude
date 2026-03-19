import prisma from '../../../prisma.js';
import { getSettings } from '../../../plugins/settings.js';
import { selectRoulettePrize, type RoulettePrize } from './roulette.engine.js';
import { InsufficientBalanceError } from '../../../lib/errors.js';
import type { User } from '@prisma/client';

export async function playRoulette(user: User) {
  const settings = await getSettings();
  const costStars = settings.rouletteCostStars;
  const prizes = settings.roulettePrizes as unknown as RoulettePrize[];

  if (user.starsBalance < costStars) {
    throw new InsufficientBalanceError('Not enough stars');
  }

  const prizeResult = selectRoulettePrize(prizes);

  const result = await prisma.$transaction(async (tx) => {
    const coinReward = prizeResult.prizeType === 'coins' ? Number(prizeResult.prizeValue) : 0;
    const starReward = prizeResult.prizeType === 'stars' ? Number(prizeResult.prizeValue) : 0;

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        starsBalance: { decrement: costStars - starReward },
        coins: { increment: coinReward },
        totalCoinsEarned: { increment: coinReward },
      },
    });

    await tx.starsTransaction.create({
      data: {
        userId: user.id,
        amount: -costStars,
        source: 'roulette_cost',
        comment: 'Roulette play',
      },
    });

    await tx.rouletteSession.create({
      data: {
        userId: user.id,
        costStars,
        result: prizeResult as unknown as Parameters<typeof tx.rouletteSession.create>[0]['data']['result'],
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'ROULETTE_PLAYED',
        data: JSON.stringify({ costStars, result: prizeResult }),
      },
    });

    const now = new Date();
    const activeTournament = await tx.tournament.findFirst({
      where: { isActive: true, startAt: { lte: now }, endAt: { gt: now } },
    });

    if (activeTournament) {
      await tx.tournamentEntry.upsert({
        where: {
          userId_tournamentId: { userId: user.id, tournamentId: activeTournament.id },
        },
        create: { userId: user.id, tournamentId: activeTournament.id, starsSpent: costStars },
        update: { starsSpent: { increment: costStars } },
      });
    }

    await tx.liveWin.create({
      data: {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        gameType: 'roulette',
        prizeName: prizeResult.prizeName,
        prizeValue: String(prizeResult.prizeValue),
        profitMultiplier: prizeResult.prizeType === 'coins' ? Number(prizeResult.prizeValue) / costStars : 1,
      },
    });

    return {
      result: prizeResult,
      newStarsBalance: updatedUser.starsBalance,
    };
  });

  return result;
}

export async function getRoulettePrizes() {
  const settings = await getSettings();
  return {
    prizes: settings.roulettePrizes,
    costStars: settings.rouletteCostStars,
  };
}

export async function getRouletteLiveWins() {
  const wins = await prisma.liveWin.findMany({
    where: { gameType: 'roulette' },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return { wins };
}
