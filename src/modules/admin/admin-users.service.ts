import prisma from '../../prisma.js';
import { extractIp } from '../../lib/ip.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import type { Admin, Prisma } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

export async function listUsers(query: {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isBlocked?: boolean;
  level?: number;
}) {
  const { page, limit, search, sortBy, sortOrder, isBlocked, level } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { telegramId: { contains: search } },
      { firstName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (isBlocked !== undefined) {
    where.isBlocked = isBlocked;
  }

  if (level !== undefined) {
    where.level = level;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        coins: true,
        totalCoinsEarned: true,
        starsBalance: true,
        level: true,
        isBlocked: true,
        loginStreak: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { referrals: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users.map((u) => ({
      ...u,
      referralCount: u._count.referrals,
      _count: undefined,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      referredBy: {
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
        },
      },
      _count: {
        select: {
          referrals: true,
          withdrawals: true,
          actions: true,
          taskCompletions: true,
          spinSessions: true,
          rouletteSessions: true,
          rideSessions: true,
          activeBoosters: true,
          tournamentEntries: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

export async function blockUser(
  userId: number,
  admin: Admin,
  request: FastifyRequest,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.isBlocked) {
    throw new BadRequestError('User is already blocked');
  }

  const ip = extractIp(request);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    await tx.action.create({
      data: {
        userId,
        type: 'ADMIN_BLOCK_USER',
        ip,
        data: JSON.stringify({ adminId: admin.id, adminUsername: admin.username }),
      },
    });

    await tx.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'BLOCK_USER',
        targetType: 'User',
        targetId: String(userId),
        details: { before: { isBlocked: false }, after: { isBlocked: true } },
        ip,
      },
    });
  });

  return { message: 'User blocked successfully' };
}

export async function unblockUser(
  userId: number,
  admin: Admin,
  request: FastifyRequest,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isBlocked) {
    throw new BadRequestError('User is not blocked');
  }

  const ip = extractIp(request);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isBlocked: false },
    });

    await tx.action.create({
      data: {
        userId,
        type: 'ADMIN_UNBLOCK_USER',
        ip,
        data: JSON.stringify({ adminId: admin.id, adminUsername: admin.username }),
      },
    });

    await tx.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'UNBLOCK_USER',
        targetType: 'User',
        targetId: String(userId),
        details: { before: { isBlocked: true }, after: { isBlocked: false } },
        ip,
      },
    });
  });

  return { message: 'User unblocked successfully' };
}

export async function adjustCoins(
  userId: number,
  amount: number,
  reason: string,
  admin: Admin,
  request: FastifyRequest,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (amount === 0) {
    throw new BadRequestError('Amount must not be zero');
  }

  const newBalance = user.coins + amount;
  if (newBalance < 0) {
    throw new BadRequestError(
      `Cannot adjust: resulting balance would be ${newBalance} (current: ${user.coins})`,
    );
  }

  const ip = extractIp(request);

  await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {
      coins: { increment: amount },
    };
    if (amount > 0) {
      updateData.totalCoinsEarned = { increment: amount };
    }

    await tx.user.update({
      where: { id: userId },
      data: updateData,
    });

    await tx.action.create({
      data: {
        userId,
        type: 'ADMIN_COIN_ADJUSTMENT',
        ip,
        data: JSON.stringify({
          amount,
          reason,
          adminId: admin.id,
          adminUsername: admin.username,
          previousBalance: user.coins,
          newBalance,
        }),
      },
    });

    await tx.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'ADJUST_COINS',
        targetType: 'User',
        targetId: String(userId),
        details: {
          amount,
          reason,
          before: { coins: user.coins },
          after: { coins: newBalance },
        },
        ip,
      },
    });
  });

  return { message: 'Coins adjusted successfully', newBalance };
}

export async function adjustStars(
  userId: number,
  amount: number,
  reason: string,
  admin: Admin,
  request: FastifyRequest,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (amount === 0) {
    throw new BadRequestError('Amount must not be zero');
  }

  const newBalance = user.starsBalance + amount;
  if (newBalance < 0) {
    throw new BadRequestError(
      `Cannot adjust: resulting balance would be ${newBalance} (current: ${user.starsBalance})`,
    );
  }

  const ip = extractIp(request);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { starsBalance: { increment: amount } },
    });

    await tx.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'ADJUST_STARS',
        targetType: 'User',
        targetId: String(userId),
        details: {
          amount,
          reason,
          before: { starsBalance: user.starsBalance },
          after: { starsBalance: newBalance },
        },
        ip,
      },
    });
  });

  return { message: 'Stars adjusted successfully', newBalance };
}

export async function resetStreak(
  userId: number,
  admin: Admin,
  request: FastifyRequest,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const ip = extractIp(request);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { loginStreak: 0 },
    });

    await tx.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'RESET_STREAK',
        targetType: 'User',
        targetId: String(userId),
        details: {
          before: { loginStreak: user.loginStreak },
          after: { loginStreak: 0 },
        },
        ip,
      },
    });
  });

  return { message: 'Login streak reset successfully' };
}

export async function getUserActions(
  userId: number,
  query: { page: number; limit: number; type?: string },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { page, limit, type } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ActionWhereInput = { userId };
  if (type) {
    where.type = type as Prisma.EnumActionTypeFilter['equals'];
  }

  const [actions, total] = await Promise.all([
    prisma.action.findMany({
      where,
      orderBy: { time: 'desc' },
      skip,
      take: limit,
    }),
    prisma.action.count({ where }),
  ]);

  return {
    data: actions.map((a) => ({
      id: a.id,
      type: a.type,
      ip: a.ip,
      time: a.time.toISOString(),
      data: JSON.parse(a.data),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
