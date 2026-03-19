import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
