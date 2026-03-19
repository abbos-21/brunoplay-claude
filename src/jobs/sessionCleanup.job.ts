import prisma from '../prisma.js';

export async function runSessionCleanup(): Promise<void> {
  const now = new Date();

  // Expire stale ride sessions
  const expiredRides = await prisma.rideSession.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });

  // Delete expired boosters
  const expiredBoosters = await prisma.activeBooster.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  if (expiredRides.count > 0 || expiredBoosters.count > 0) {
    console.log(
      `Session cleanup: ${expiredRides.count} rides expired, ${expiredBoosters.count} boosters removed`,
    );
  }
}
