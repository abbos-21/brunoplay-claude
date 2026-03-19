import prisma from '../../prisma.js';
import { extractIp } from '../../lib/ip.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import type { Admin, Prisma } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

// ─── TASKS ───

export async function listTasks(query: { category?: string; type?: string; isActive?: string }) {
  const where: Prisma.TaskWhereInput = {};
  if (query.category) where.category = query.category as Prisma.EnumTaskCategoryFilter['equals'];
  if (query.type) where.type = query.type as Prisma.EnumTaskTypeFilter['equals'];
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

  return prisma.task.findMany({ where, orderBy: { sortOrder: 'asc' } });
}

export async function createTask(
  data: {
    category: 'MAIN' | 'OTHER';
    type: 'CHANNEL_JOIN' | 'INVITE_FRIENDS';
    title: string;
    description?: string;
    channelUsername?: string;
    requiredInvites?: number;
    rewardCoins: number;
    sortOrder?: number;
  },
  admin: Admin,
  request: FastifyRequest,
) {
  const task = await prisma.task.create({ data: data as Prisma.TaskCreateInput });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE_TASK',
      targetType: 'Task',
      targetId: String(task.id),
      details: data as unknown as Prisma.JsonObject,
      ip: extractIp(request),
    },
  });

  return task;
}

export async function updateTask(
  taskId: number,
  data: Record<string, unknown>,
  admin: Admin,
  request: FastifyRequest,
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  const updated = await prisma.task.update({ where: { id: taskId }, data });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'UPDATE_TASK',
      targetType: 'Task',
      targetId: String(taskId),
      details: { before: task, after: data } as unknown as Prisma.JsonObject,
      ip: extractIp(request),
    },
  });

  return updated;
}

export async function deleteTask(taskId: number, admin: Admin, request: FastifyRequest) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  await prisma.taskCompletion.deleteMany({ where: { taskId } });
  await prisma.task.delete({ where: { id: taskId } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'DELETE_TASK',
      targetType: 'Task',
      targetId: String(taskId),
      details: { deleted: task } as unknown as Prisma.JsonObject,
      ip: extractIp(request),
    },
  });

  return { message: 'Task deleted' };
}

// ─── DAILY COMBO ───

export async function listDailyCombos(from?: string, to?: string) {
  const where: Prisma.DailyComboWhereInput = {};
  if (from) where.date = { ...where.date as Prisma.DateTimeFilter, gte: new Date(from) };
  if (to) where.date = { ...where.date as Prisma.DateTimeFilter, lte: new Date(to) };

  return prisma.dailyCombo.findMany({ where, orderBy: { date: 'desc' } });
}

export async function createDailyCombo(
  date: string,
  correctItems: number[],
  admin: Admin,
  request: FastifyRequest,
) {
  const comboDate = new Date(date + 'T00:00:00.000Z');

  const combo = await prisma.dailyCombo.upsert({
    where: { date: comboDate },
    create: { date: comboDate, correctItems },
    update: { correctItems },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'SET_DAILY_COMBO',
      targetType: 'DailyCombo',
      targetId: String(combo.id),
      details: { date, correctItems } as unknown as Prisma.JsonObject,
      ip: extractIp(request),
    },
  });

  return combo;
}

export async function bulkCreateDailyCombos(
  combos: { date: string; correctItems: number[] }[],
  admin: Admin,
  request: FastifyRequest,
) {
  const results = [];
  for (const c of combos) {
    const result = await createDailyCombo(c.date, c.correctItems, admin, request);
    results.push(result);
  }
  return results;
}

// ─── TOURNAMENTS ───

export async function listTournaments() {
  return prisma.tournament.findMany({ orderBy: { startAt: 'desc' } });
}

export async function createTournament(
  data: { name: string; description?: string; startAt: string; endAt: string; rewards: unknown },
  admin: Admin,
  request: FastifyRequest,
) {
  const startAt = new Date(data.startAt);
  const endAt = new Date(data.endAt);

  if (startAt >= endAt) throw new BadRequestError('startAt must be before endAt');

  const overlap = await prisma.tournament.findFirst({
    where: {
      isActive: true,
      OR: [
        { startAt: { lte: endAt }, endAt: { gte: startAt } },
      ],
    },
  });

  if (overlap) throw new BadRequestError('Overlapping active tournament exists');

  const tournament = await prisma.tournament.create({
    data: { name: data.name, description: data.description ?? '', startAt, endAt, rewards: data.rewards as Prisma.JsonObject },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE_TOURNAMENT',
      targetType: 'Tournament',
      targetId: String(tournament.id),
      details: data as unknown as Prisma.JsonObject,
      ip: extractIp(request),
    },
  });

  return tournament;
}

export async function updateTournament(
  tournamentId: number,
  data: Record<string, unknown>,
  admin: Admin,
  request: FastifyRequest,
) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new NotFoundError('Tournament not found');

  const updateData: Record<string, unknown> = { ...data };
  if (data.startAt) updateData.startAt = new Date(data.startAt as string);
  if (data.endAt) updateData.endAt = new Date(data.endAt as string);

  const updated = await prisma.tournament.update({ where: { id: tournamentId }, data: updateData });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'UPDATE_TOURNAMENT',
      targetType: 'Tournament',
      targetId: String(tournamentId),
      ip: extractIp(request),
    },
  });

  return updated;
}

export async function deleteTournament(tournamentId: number, admin: Admin, request: FastifyRequest) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new NotFoundError('Tournament not found');

  await prisma.tournamentEntry.deleteMany({ where: { tournamentId } });
  await prisma.tournament.delete({ where: { id: tournamentId } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'DELETE_TOURNAMENT',
      targetType: 'Tournament',
      targetId: String(tournamentId),
      ip: extractIp(request),
    },
  });

  return { message: 'Tournament deleted' };
}

export async function finalizeTournament(tournamentId: number, admin: Admin, request: FastifyRequest) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new NotFoundError('Tournament not found');

  const entries = await prisma.tournamentEntry.findMany({
    where: { tournamentId },
    orderBy: { starsSpent: 'desc' },
  });

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < entries.length; i++) {
      await tx.tournamentEntry.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { isActive: false },
    });
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'FINALIZE_TOURNAMENT',
      targetType: 'Tournament',
      targetId: String(tournamentId),
      details: { entriesRanked: entries.length } as unknown as Prisma.JsonObject,
      ip: extractIp(request),
    },
  });

  return { message: 'Tournament finalized', entriesRanked: entries.length };
}

// ─── CARD REQUIREMENTS ───

export async function listCardRequirements() {
  return prisma.cardUpgradeRequirement.findMany({ orderBy: [{ cardName: 'asc' }, { level: 'asc' }] });
}

export async function createCardRequirement(
  data: {
    cardName: 'COIN_CAPACITY' | 'MINING_RATE';
    level: number;
    description: string;
    requirementType: string;
    requirementValue: string;
  },
  admin: Admin,
  request: FastifyRequest,
) {
  const req = await prisma.cardUpgradeRequirement.create({ data });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE_CARD_REQUIREMENT',
      targetType: 'CardUpgradeRequirement',
      targetId: String(req.id),
      details: data as unknown as Prisma.JsonObject,
      ip: extractIp(request),
    },
  });

  return req;
}

export async function updateCardRequirement(
  requirementId: number,
  data: Record<string, unknown>,
  admin: Admin,
  request: FastifyRequest,
) {
  const existing = await prisma.cardUpgradeRequirement.findUnique({ where: { id: requirementId } });
  if (!existing) throw new NotFoundError('Card requirement not found');

  const updated = await prisma.cardUpgradeRequirement.update({ where: { id: requirementId }, data });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'UPDATE_CARD_REQUIREMENT',
      targetType: 'CardUpgradeRequirement',
      targetId: String(requirementId),
      ip: extractIp(request),
    },
  });

  return updated;
}

export async function deleteCardRequirement(requirementId: number, admin: Admin, request: FastifyRequest) {
  const existing = await prisma.cardUpgradeRequirement.findUnique({ where: { id: requirementId } });
  if (!existing) throw new NotFoundError('Card requirement not found');

  await prisma.cardUpgradeRequirement.delete({ where: { id: requirementId } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'DELETE_CARD_REQUIREMENT',
      targetType: 'CardUpgradeRequirement',
      targetId: String(requirementId),
      ip: extractIp(request),
    },
  });

  return { message: 'Card requirement deleted' };
}

// ─── SEASONS ───

export async function listSeasons() {
  return prisma.season.findMany({ orderBy: { start: 'desc' } });
}

export async function createSeason(
  data: { name: string; start: string; end: string },
  admin: Admin,
  request: FastifyRequest,
) {
  const season = await prisma.season.create({
    data: { name: data.name, start: new Date(data.start), end: new Date(data.end) },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE_SEASON',
      targetType: 'Season',
      targetId: String(season.id),
      ip: extractIp(request),
    },
  });

  return season;
}

export async function updateSeason(
  seasonId: number,
  data: Record<string, unknown>,
  admin: Admin,
  request: FastifyRequest,
) {
  const existing = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!existing) throw new NotFoundError('Season not found');

  const updateData: Record<string, unknown> = { ...data };
  if (data.start) updateData.start = new Date(data.start as string);
  if (data.end) updateData.end = new Date(data.end as string);

  const updated = await prisma.season.update({ where: { id: seasonId }, data: updateData });
  return updated;
}

export async function deleteSeason(seasonId: number, admin: Admin, request: FastifyRequest) {
  const existing = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!existing) throw new NotFoundError('Season not found');

  await prisma.season.delete({ where: { id: seasonId } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'DELETE_SEASON',
      targetType: 'Season',
      targetId: String(seasonId),
      ip: extractIp(request),
    },
  });

  return { message: 'Season deleted' };
}

// ─── AUDIT LOG ───

export async function getAuditLog(query: {
  page: number;
  limit: number;
  adminId?: number;
  action?: string;
  targetType?: string;
  targetId?: string;
}) {
  const { page, limit, adminId, action, targetType, targetId } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.AdminAuditLogWhereInput = {};
  if (adminId) where.adminId = adminId;
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { admin: { select: { username: true, role: true } } },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return { data: logs, total, page, totalPages: Math.ceil(total / limit) };
}
