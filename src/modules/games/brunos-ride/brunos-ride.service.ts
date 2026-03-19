import prisma from '../../../prisma.js';
import { getSettings } from '../../../plugins/settings.js';
import { RIDE_SESSION_EXPIRY_MS } from '../../../config/constants.js';
import { InsufficientBalanceError, BadRequestError, ConflictError } from '../../../lib/errors.js';
import type { User } from '@prisma/client';

export async function startRide(user: User) {
  const settings = await getSettings();
  const costStars = settings.rideCostStars;

  if (user.starsBalance < costStars) {
    throw new InsufficientBalanceError('Not enough stars');
  }

  const existingActive = await prisma.rideSession.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
  });

  if (existingActive) {
    throw new ConflictError('Already have an active ride session');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + RIDE_SESSION_EXPIRY_MS);

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { starsBalance: { decrement: costStars } },
    });

    await tx.starsTransaction.create({
      data: {
        userId: user.id,
        amount: -costStars,
        source: 'ride_cost',
        comment: "Bruno's Ride entry",
      },
    });

    const session = await tx.rideSession.create({
      data: {
        userId: user.id,
        costStars,
        expiresAt,
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'BRUNOS_RIDE_STARTED',
        data: JSON.stringify({ sessionId: session.id }),
      },
    });

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

    return {
      sessionId: session.id,
      startTime: session.startTime.toISOString(),
    };
  });

  return result;
}

export async function claimRide(user: User, sessionId: string, coins: number, score: number) {
  const session = await prisma.rideSession.findUnique({ where: { id: sessionId } });

  if (!session || session.userId !== user.id) {
    throw new BadRequestError('Session not found');
  }

  if (session.status !== 'ACTIVE') {
    throw new BadRequestError('Session is not active');
  }

  const now = new Date();
  if (now > session.expiresAt) {
    await prisma.rideSession.update({
      where: { id: sessionId },
      data: { status: 'EXPIRED' },
    });
    throw new BadRequestError('Session has expired');
  }

  const settings = await getSettings();
  const durationSeconds = (now.getTime() - session.startTime.getTime()) / 1000;
  const maxCoins = Math.ceil(durationSeconds * settings.rideMaxCoinsPerSecond);

  if (coins > maxCoins) {
    await prisma.$transaction(async (tx) => {
      await tx.rideSession.update({
        where: { id: sessionId },
        data: { status: 'FLAGGED_CHEAT', score, coinsEarned: coins, endTime: now },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { isBlocked: true },
      });
      await tx.action.create({
        data: {
          userId: user.id,
          type: 'BRUNOS_RIDE_CHEATED',
          data: JSON.stringify({ sessionId, claimedCoins: coins, maxAllowed: maxCoins, durationSeconds }),
        },
      });
    });
    throw new BadRequestError('Anti-cheat: impossible coin count detected. Account flagged.');
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.rideSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', score, coinsEarned: coins, endTime: now },
    });

    const updated = await tx.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: coins },
        totalCoinsEarned: { increment: coins },
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'BRUNOS_RIDE_COMPLETED',
        data: JSON.stringify({ sessionId, coins, score }),
      },
    });

    return {
      coinsEarned: coins,
      newBalance: updated.coins,
      score,
    };
  });

  return result;
}

export async function getRideStatus(user: User) {
  const activeSession = await prisma.rideSession.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
  });

  if (!activeSession) {
    return { activeSession: null };
  }

  return {
    activeSession: {
      sessionId: activeSession.id,
      startTime: activeSession.startTime.toISOString(),
      expiresAt: activeSession.expiresAt.toISOString(),
    },
  };
}
