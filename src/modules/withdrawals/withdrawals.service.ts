import prisma from '../../prisma.js';
import { getSettings } from '../../plugins/settings.js';
import { queueWithdrawal } from '../../services/tonService.js';
import { extractIp } from '../../lib/ip.js';
import {
  BadRequestError,
  ForbiddenError,
  InsufficientBalanceError,
} from '../../lib/errors.js';
import type { User } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

function isValidTonAddress(address: string): boolean {
  // Basic TON address validation: EQ or UQ prefix + base64, or raw hex
  return /^(EQ|UQ|0:)[a-zA-Z0-9_\-+/=]{46,}$/.test(address) || /^[0-9a-fA-F]{64}$/.test(address);
}

export async function getWithdrawalInfo(user: User) {
  const settings = await getSettings();
  return {
    coinToTonRate: settings.coinToTonRate,
    minCoins: settings.minimumCoinWithdrawal,
    maxCoins: settings.maximumCoinWithdrawal,
    feeTon: settings.withdrawalFeeTon,
    currentBalance: user.coins,
  };
}

export async function createWithdrawal(
  user: User,
  targetAddress: string,
  amountCoins: number,
  request: FastifyRequest,
) {
  const settings = await getSettings();
  const ip = extractIp(request);

  if (!isValidTonAddress(targetAddress)) {
    throw new BadRequestError('Invalid TON address');
  }

  const withdrawal = await prisma.$transaction(async (tx) => {
    const freshUser = await tx.user.findUniqueOrThrow({ where: { id: user.id } });

    if (freshUser.isBlocked) {
      throw new ForbiddenError('Account is blocked');
    }

    if (freshUser.coins < amountCoins) {
      throw new InsufficientBalanceError('Not enough coins');
    }

    if (amountCoins < settings.minimumCoinWithdrawal) {
      throw new BadRequestError(`Minimum withdrawal: ${settings.minimumCoinWithdrawal} coins`);
    }

    if (amountCoins > settings.maximumCoinWithdrawal) {
      throw new BadRequestError(`Maximum withdrawal: ${settings.maximumCoinWithdrawal} coins`);
    }

    const amountTon = amountCoins / settings.coinToTonRate;

    await tx.user.update({
      where: { id: user.id },
      data: { coins: { decrement: amountCoins } },
    });

    const w = await tx.withdrawal.create({
      data: {
        userId: user.id,
        amountCoins,
        amountTon,
        ip,
        targetAddress,
        status: 'PENDING',
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'WITHDRAWAL_REQUESTED',
        ip,
        data: JSON.stringify({ withdrawalId: w.id, amountCoins, amountTon, targetAddress }),
      },
    });

    return w;
  });

  // Process withdrawal asynchronously
  processWithdrawal(withdrawal.id, targetAddress, withdrawal.amountTon);

  return {
    withdrawal: {
      id: withdrawal.id,
      amountCoins: withdrawal.amountCoins,
      amountTon: withdrawal.amountTon,
      status: withdrawal.status,
    },
  };
}

async function processWithdrawal(
  withdrawalId: number,
  targetAddress: string,
  amountTon: number,
) {
  try {
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 'PROCESSING' },
    });

    const { txHash } = await queueWithdrawal(targetAddress, amountTon);

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'COMPLETED',
        txHash,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function getWithdrawalHistory(userId: number, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [withdrawals, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.withdrawal.count({ where: { userId } }),
  ]);

  return {
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      targetAddress: w.targetAddress,
      amountCoins: w.amountCoins,
      amountTon: w.amountTon,
      status: w.status,
      txHash: w.txHash,
      createdAt: w.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
