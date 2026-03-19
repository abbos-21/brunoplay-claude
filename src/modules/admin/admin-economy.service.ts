import prisma from '../../prisma.js';
import { extractIp } from '../../lib/ip.js';
import { queueWithdrawal } from '../../services/tonService.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import type { Admin, Prisma } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

export async function listWithdrawals(query: {
  page: number;
  limit: number;
  status?: string;
  userId?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  const { page, limit, status, userId, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.WithdrawalWhereInput = {};
  if (status) where.status = status as Prisma.EnumWithdrawalStatusFilter['equals'];
  if (userId) where.userId = userId;

  const [withdrawals, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: { user: { select: { username: true, telegramId: true, firstName: true } } },
    }),
    prisma.withdrawal.count({ where }),
  ]);

  return { data: withdrawals, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getWithdrawalById(withdrawalId: number) {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
    include: { user: { select: { username: true, telegramId: true, firstName: true, coins: true } } },
  });
  if (!withdrawal) throw new NotFoundError('Withdrawal not found');
  return withdrawal;
}

export async function approveWithdrawal(
  withdrawalId: number,
  admin: Admin,
  request: FastifyRequest,
) {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) throw new NotFoundError('Withdrawal not found');
  if (withdrawal.status !== 'PENDING') throw new BadRequestError('Withdrawal is not pending');

  const ip = extractIp(request);

  await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: { status: 'PROCESSING' },
  });

  try {
    const { txHash } = await queueWithdrawal(withdrawal.targetAddress, withdrawal.amountTon);
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 'COMPLETED', txHash, processedAt: new Date() },
    });

    await prisma.action.create({
      data: {
        userId: withdrawal.userId,
        type: 'WITHDRAWAL_COMPLETED',
        data: JSON.stringify({ withdrawalId, txHash }),
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'APPROVE_WITHDRAWAL',
        targetType: 'Withdrawal',
        targetId: String(withdrawalId),
        details: { amountTon: withdrawal.amountTon, txHash },
        ip,
      },
    });

    return { message: 'Withdrawal approved and processed', txHash };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 'FAILED', errorMessage },
    });

    await prisma.action.create({
      data: {
        userId: withdrawal.userId,
        type: 'WITHDRAWAL_FAILED',
        data: JSON.stringify({ withdrawalId, error: errorMessage }),
      },
    });

    throw new BadRequestError(`Withdrawal failed: ${errorMessage}`);
  }
}

export async function rejectWithdrawal(
  withdrawalId: number,
  reason: string,
  admin: Admin,
  request: FastifyRequest,
) {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) throw new NotFoundError('Withdrawal not found');
  if (withdrawal.status !== 'PENDING') throw new BadRequestError('Withdrawal is not pending');

  const ip = extractIp(request);

  await prisma.$transaction(async (tx) => {
    await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 'CANCELLED', errorMessage: reason },
    });

    await tx.user.update({
      where: { id: withdrawal.userId },
      data: { coins: { increment: withdrawal.amountCoins } },
    });

    await tx.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'REJECT_WITHDRAWAL',
        targetType: 'Withdrawal',
        targetId: String(withdrawalId),
        details: { reason, amountRefunded: withdrawal.amountCoins },
        ip,
      },
    });
  });

  return { message: 'Withdrawal rejected and coins refunded' };
}

export async function getWithdrawalStats() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [pending, completed, failed, todayWithdrawals] = await Promise.all([
    prisma.withdrawal.aggregate({
      where: { status: 'PENDING' },
      _count: true,
      _sum: { amountCoins: true },
    }),
    prisma.withdrawal.aggregate({
      where: { status: 'COMPLETED' },
      _count: true,
      _sum: { amountTon: true },
    }),
    prisma.withdrawal.count({ where: { status: 'FAILED' } }),
    prisma.withdrawal.aggregate({
      where: { createdAt: { gte: today } },
      _count: true,
      _sum: { amountCoins: true },
    }),
  ]);

  return {
    totalPending: pending._count,
    totalPendingAmount: pending._sum.amountCoins ?? 0,
    totalCompleted: completed._count,
    totalCompletedAmount: completed._sum.amountTon ?? 0,
    totalFailed: failed,
    todayCount: todayWithdrawals._count,
    todayAmount: todayWithdrawals._sum.amountCoins ?? 0,
  };
}
