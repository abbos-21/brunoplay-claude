import prisma from '../prisma.js';

export async function runTournamentEnd(): Promise<void> {
  const now = new Date();

  const endedTournaments = await prisma.tournament.findMany({
    where: {
      isActive: true,
      endAt: { lt: now },
    },
  });

  for (const tournament of endedTournaments) {
    await prisma.$transaction(async (tx) => {
      const entries = await tx.tournamentEntry.findMany({
        where: { tournamentId: tournament.id },
        orderBy: { starsSpent: 'desc' },
      });

      for (let i = 0; i < entries.length; i++) {
        await tx.tournamentEntry.update({
          where: { id: entries[i].id },
          data: { rank: i + 1 },
        });
      }

      // Distribute rewards to top players
      const rewards = tournament.rewards as Record<string, number>;
      for (const [rankStr, rewardAmount] of Object.entries(rewards)) {
        const rank = parseInt(rankStr, 10);
        const entry = entries[rank - 1];
        if (entry && rewardAmount > 0) {
          await tx.user.update({
            where: { id: entry.userId },
            data: {
              coins: { increment: rewardAmount },
              totalCoinsEarned: { increment: rewardAmount },
            },
          });
        }
      }

      await tx.tournament.update({
        where: { id: tournament.id },
        data: { isActive: false },
      });
    });

    console.log(`Tournament "${tournament.name}" (ID: ${tournament.id}) finalized`);
  }
}
