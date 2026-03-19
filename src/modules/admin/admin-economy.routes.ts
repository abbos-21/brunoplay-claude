import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../plugins/adminAuth.js';
import { BadRequestError } from '../../lib/errors.js';
import {
  listWithdrawalsQuerySchema,
  withdrawalIdParamSchema,
  rejectWithdrawalSchema,
} from './admin.schema.js';
import {
  listWithdrawals,
  getWithdrawalById,
  approveWithdrawal,
  rejectWithdrawal,
  getWithdrawalStats,
} from './admin-economy.service.js';

export default async function adminEconomyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticateAdmin);

  fastify.get(
    '/api/admin/withdrawals',
    { preHandler: [requireRole('MODERATOR')] },
    async (request, reply) => {
      const parsed = listWithdrawalsQuerySchema.safeParse(request.query);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await listWithdrawals(parsed.data);
      return reply.send(result);
    },
  );

  fastify.get(
    '/api/admin/withdrawals/stats',
    { preHandler: [requireRole('MODERATOR')] },
    async (_request, reply) => {
      const result = await getWithdrawalStats();
      return reply.send(result);
    },
  );

  fastify.get(
    '/api/admin/withdrawals/:withdrawalId',
    { preHandler: [requireRole('MODERATOR')] },
    async (request, reply) => {
      const parsed = withdrawalIdParamSchema.safeParse(request.params);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await getWithdrawalById(parsed.data.withdrawalId);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/withdrawals/:withdrawalId/approve',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = withdrawalIdParamSchema.safeParse(request.params);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await approveWithdrawal(parsed.data.withdrawalId, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/withdrawals/:withdrawalId/reject',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      const paramsParsed = withdrawalIdParamSchema.safeParse(request.params);
      if (!paramsParsed.success) throw new BadRequestError(paramsParsed.error.issues[0].message);
      const bodyParsed = rejectWithdrawalSchema.safeParse(request.body);
      if (!bodyParsed.success) throw new BadRequestError(bodyParsed.error.issues[0].message);
      const result = await rejectWithdrawal(
        paramsParsed.data.withdrawalId,
        bodyParsed.data.reason,
        request.admin!,
        request,
      );
      return reply.send(result);
    },
  );
}
