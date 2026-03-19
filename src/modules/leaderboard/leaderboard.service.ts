import prisma from '../../prisma.js';
import type { User } from '@prisma/client';

export async function getActiveTournament() {
  const now = new Date();
  const tournament = await prisma.tournament.findFirst({
    where: {
      isActive: true,
      startAt: { lte: now },
      endAt: { gt: now },
    },
  });

  if (!tournament) return { tournament: null };

  const timeRemaining = tournament.endAt.getTime() - now.getTime();

  return {
    tournament: {
      id: tournament.id,
      name: tournament.name,
      endAt: tournament.endAt.toISOString(),
      timeRemaining: Math.max(0, timeRemaining),
    },
  };
}

export async function getTournamentLeaderboard(
  tournamentId: number,
  userId: number,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.tournamentEntry.findMany({
      where: { tournamentId },
      orderBy: { starsSpent: 'desc' },
      include: {
        user: { select: { username: true, firstName: true } },
      },
      skip,
      take: limit,
    }),
    prisma.tournamentEntry.count({ where: { tournamentId } }),
  ]);

  const leaderboard = entries.map((e, i) => ({
    rank: skip + i + 1,
    username: e.user.username,
    firstName: e.user.firstName,
    starsSpent: e.starsSpent,
  }));

  const myEntry = await prisma.tournamentEntry.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });

  let myRank: number | null = null;
  if (myEntry) {
    const higherCount = await prisma.tournamentEntry.count({
      where: { tournamentId, starsSpent: { gt: myEntry.starsSpent } },
    });
    myRank = higherCount + 1;
  }

  return {
    leaderboard,
    myRank,
    myStarsSpent: myEntry?.starsSpent ?? 0,
    total,
  };
}
