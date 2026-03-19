import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../plugins/adminAuth.js';
import { BadRequestError } from '../../lib/errors.js';
import {
  listUsersQuerySchema,
  userIdParamSchema,
  adjustCoinsSchema,
  adjustStarsSchema,
  userActionsQuerySchema,
} from './admin.schema.js';
import {
  listUsers,
  getUser,
  blockUser,
  unblockUser,
  adjustCoins,
  adjustStars,
  resetStreak,
  getUserActions,
} from './admin-users.service.js';

export default async function adminUsersRoutes(fastify: FastifyInstance) {
  // All routes require at minimum MODERATOR
  fastify.addHook('preHandler', fastify.authenticateAdmin);

  // List users — MODERATOR+
  fastify.get(
    '/api/admin/users',
    { preHandler: [requireRole('MODERATOR')] },
    async (request, reply) => {
      const parsed = listUsersQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.issues[0].message);
      }
      const result = await listUsers(parsed.data);
      return reply.send(result);
    },
  );

  // Get single user — MODERATOR+
  fastify.get(
    '/api/admin/users/:userId',
    { preHandler: [requireRole('MODERATOR')] },
    async (request, reply) => {
      const parsed = userIdParamSchema.safeParse(request.params);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.issues[0].message);
      }
      const user = await getUser(parsed.data.userId);
      return reply.send({ user });
    },
  );

  // Block user — ADMIN+
  fastify.post(
    '/api/admin/users/:userId/block',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      const parsed = userIdParamSchema.safeParse(request.params);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.issues[0].message);
      }
      const result = await blockUser(parsed.data.userId, request.admin!, request);
      return reply.send(result);
    },
  );

  // Unblock user — ADMIN+
  fastify.post(
    '/api/admin/users/:userId/unblock',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      const parsed = userIdParamSchema.safeParse(request.params);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.issues[0].message);
      }
      const result = await unblockUser(parsed.data.userId, request.admin!, request);
      return reply.send(result);
    },
  );

  // Adjust coins — SUPER_ADMIN
  fastify.post(
    '/api/admin/users/:userId/adjust-coins',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const paramsParsed = userIdParamSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        throw new BadRequestError(paramsParsed.error.issues[0].message);
      }
      const bodyParsed = adjustCoinsSchema.safeParse(request.body);
      if (!bodyParsed.success) {
        throw new BadRequestError(bodyParsed.error.issues[0].message);
      }
      const result = await adjustCoins(
        paramsParsed.data.userId,
        bodyParsed.data.amount,
        bodyParsed.data.reason,
        request.admin!,
        request,
      );
      return reply.send(result);
    },
  );

  // Adjust stars — SUPER_ADMIN
  fastify.post(
    '/api/admin/users/:userId/adjust-stars',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const paramsParsed = userIdParamSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        throw new BadRequestError(paramsParsed.error.issues[0].message);
      }
      const bodyParsed = adjustStarsSchema.safeParse(request.body);
      if (!bodyParsed.success) {
        throw new BadRequestError(bodyParsed.error.issues[0].message);
      }
      const result = await adjustStars(
        paramsParsed.data.userId,
        bodyParsed.data.amount,
        bodyParsed.data.reason,
        request.admin!,
        request,
      );
      return reply.send(result);
    },
  );

  // Reset streak — ADMIN+
  fastify.post(
    '/api/admin/users/:userId/reset-streak',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      const parsed = userIdParamSchema.safeParse(request.params);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.issues[0].message);
      }
      const result = await resetStreak(parsed.data.userId, request.admin!, request);
      return reply.send(result);
    },
  );

  // Get user actions — MODERATOR+
  fastify.get(
    '/api/admin/users/:userId/actions',
    { preHandler: [requireRole('MODERATOR')] },
    async (request, reply) => {
      const paramsParsed = userIdParamSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        throw new BadRequestError(paramsParsed.error.issues[0].message);
      }
      const queryParsed = userActionsQuerySchema.safeParse(request.query);
      if (!queryParsed.success) {
        throw new BadRequestError(queryParsed.error.issues[0].message);
      }
      const result = await getUserActions(paramsParsed.data.userId, queryParsed.data);
      return reply.send(result);
    },
  );
}
