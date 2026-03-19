import type { FastifyInstance } from 'fastify';
import prisma from '../../prisma.js';
import { requireRole } from '../../plugins/adminAuth.js';
import { BadRequestError } from '../../lib/errors.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  createDailyComboSchema,
  bulkCreateDailyComboSchema,
  createTournamentSchema,
  updateTournamentSchema,
  tournamentIdParamSchema,
  createCardRequirementSchema,
  updateCardRequirementSchema,
  cardRequirementIdParamSchema,
  broadcastMessageSchema,
  auditLogQuerySchema,
  createSeasonSchema,
  updateSeasonSchema,
} from './admin.schema.js';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listDailyCombos,
  createDailyCombo,
  bulkCreateDailyCombos,
  listTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  finalizeTournament,
  listCardRequirements,
  createCardRequirement,
  updateCardRequirement,
  deleteCardRequirement,
  listSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
  getAuditLog,
} from './admin-content.service.js';

export default async function adminContentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticateAdmin);

  // ─── TASKS ───
  fastify.get('/api/admin/tasks', { preHandler: [requireRole('MODERATOR')] }, async (request, reply) => {
    const query = request.query as Record<string, string>;
    const result = await listTasks(query);
    return reply.send(result);
  });

  fastify.post('/api/admin/tasks', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const result = await createTask(parsed.data, request.admin!, request);
    return reply.status(201).send(result);
  });

  fastify.put('/api/admin/tasks/:taskId', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const params = taskIdParamSchema.safeParse(request.params);
    if (!params.success) throw new BadRequestError(params.error.issues[0].message);
    const body = updateTaskSchema.safeParse(request.body);
    if (!body.success) throw new BadRequestError(body.error.issues[0].message);
    const result = await updateTask(params.data.taskId, body.data, request.admin!, request);
    return reply.send(result);
  });

  fastify.delete('/api/admin/tasks/:taskId', { preHandler: [requireRole('SUPER_ADMIN')] }, async (request, reply) => {
    const params = taskIdParamSchema.safeParse(request.params);
    if (!params.success) throw new BadRequestError(params.error.issues[0].message);
    const result = await deleteTask(params.data.taskId, request.admin!, request);
    return reply.send(result);
  });

  // ─── DAILY COMBO ───
  fastify.get('/api/admin/daily-combo', { preHandler: [requireRole('MODERATOR')] }, async (request, reply) => {
    const query = request.query as { from?: string; to?: string };
    const result = await listDailyCombos(query.from, query.to);
    return reply.send(result);
  });

  fastify.post('/api/admin/daily-combo', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const parsed = createDailyComboSchema.safeParse(request.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const result = await createDailyCombo(parsed.data.date, parsed.data.correctItems, request.admin!, request);
    return reply.status(201).send(result);
  });

  fastify.post('/api/admin/daily-combo/bulk', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const parsed = bulkCreateDailyComboSchema.safeParse(request.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const result = await bulkCreateDailyCombos(parsed.data.combos, request.admin!, request);
    return reply.status(201).send(result);
  });

  // ─── TOURNAMENTS ───
  fastify.get('/api/admin/tournaments', { preHandler: [requireRole('MODERATOR')] }, async (_request, reply) => {
    const result = await listTournaments();
    return reply.send(result);
  });

  fastify.post('/api/admin/tournaments', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const parsed = createTournamentSchema.safeParse(request.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const result = await createTournament(parsed.data, request.admin!, request);
    return reply.status(201).send(result);
  });

  fastify.put('/api/admin/tournaments/:tournamentId', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const params = tournamentIdParamSchema.safeParse(request.params);
    if (!params.success) throw new BadRequestError(params.error.issues[0].message);
    const body = updateTournamentSchema.safeParse(request.body);
    if (!body.success) throw new BadRequestError(body.error.issues[0].message);
    const result = await updateTournament(params.data.tournamentId, body.data, request.admin!, request);
    return reply.send(result);
  });

  fastify.delete('/api/admin/tournaments/:tournamentId', { preHandler: [requireRole('SUPER_ADMIN')] }, async (request, reply) => {
    const params = tournamentIdParamSchema.safeParse(request.params);
    if (!params.success) throw new BadRequestError(params.error.issues[0].message);
    const result = await deleteTournament(params.data.tournamentId, request.admin!, request);
    return reply.send(result);
  });

  fastify.post('/api/admin/tournaments/:tournamentId/finalize', { preHandler: [requireRole('SUPER_ADMIN')] }, async (request, reply) => {
    const params = tournamentIdParamSchema.safeParse(request.params);
    if (!params.success) throw new BadRequestError(params.error.issues[0].message);
    const result = await finalizeTournament(params.data.tournamentId, request.admin!, request);
    return reply.send(result);
  });

  // ─── CARD REQUIREMENTS ───
  fastify.get('/api/admin/card-requirements', { preHandler: [requireRole('MODERATOR')] }, async (_request, reply) => {
    const result = await listCardRequirements();
    return reply.send(result);
  });

  fastify.post('/api/admin/card-requirements', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const parsed = createCardRequirementSchema.safeParse(request.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const result = await createCardRequirement(parsed.data, request.admin!, request);
    return reply.status(201).send(result);
  });

  fastify.put('/api/admin/card-requirements/:requirementId', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const params = cardRequirementIdParamSchema.safeParse(request.params);
    if (!params.success) throw new BadRequestError(params.error.issues[0].message);
    const body = updateCardRequirementSchema.safeParse(request.body);
    if (!body.success) throw new BadRequestError(body.error.issues[0].message);
    const result = await updateCardRequirement(params.data.requirementId, body.data, request.admin!, request);
    return reply.send(result);
  });

  fastify.delete('/api/admin/card-requirements/:requirementId', { preHandler: [requireRole('SUPER_ADMIN')] }, async (request, reply) => {
    const params = cardRequirementIdParamSchema.safeParse(request.params);
    if (!params.success) throw new BadRequestError(params.error.issues[0].message);
    const result = await deleteCardRequirement(params.data.requirementId, request.admin!, request);
    return reply.send(result);
  });

  // ─── SEASONS ───
  fastify.get('/api/admin/seasons', { preHandler: [requireRole('MODERATOR')] }, async (_request, reply) => {
    const result = await listSeasons();
    return reply.send(result);
  });

  fastify.post('/api/admin/seasons', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const parsed = createSeasonSchema.safeParse(request.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const result = await createSeason(parsed.data, request.admin!, request);
    return reply.status(201).send(result);
  });

  fastify.put('/api/admin/seasons/:id', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    const id = parseInt((request.params as { id: string }).id, 10);
    const body = updateSeasonSchema.safeParse(request.body);
    if (!body.success) throw new BadRequestError(body.error.issues[0].message);
    const result = await updateSeason(id, body.data, request.admin!, request);
    return reply.send(result);
  });

  fastify.delete('/api/admin/seasons/:id', { preHandler: [requireRole('SUPER_ADMIN')] }, async (request, reply) => {
    const id = parseInt((request.params as { id: string }).id, 10);
    const result = await deleteSeason(id, request.admin!, request);
    return reply.send(result);
  });

  // ─── AUDIT LOG ───
  fastify.get('/api/admin/audit-log', { preHandler: [requireRole('MODERATOR')] }, async (request, reply) => {
    const parsed = auditLogQuerySchema.safeParse(request.query);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const result = await getAuditLog(parsed.data);
    return reply.send(result);
  });

  // ─── BROADCAST ───
  fastify.post('/api/admin/broadcast', { preHandler: [requireRole('SUPER_ADMIN')] }, async (request, reply) => {
    const parsed = broadcastMessageSchema.safeParse(request.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
    const userCount = await prisma.user.count({ where: { isBlocked: false } });
    // Broadcast is queued — in production, this would use p-queue + bot.api.sendMessage
    return reply.send({ jobId: `broadcast_${Date.now()}`, targetCount: userCount });
  });
}
