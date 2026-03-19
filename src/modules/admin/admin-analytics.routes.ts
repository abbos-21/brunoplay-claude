import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../plugins/adminAuth.js';
import {
  getOverview,
  getRegistrations,
  getEconomyAnalytics,
  getGamesAnalytics,
  getReferralAnalytics,
} from './admin-analytics.service.js';

export default async function adminAnalyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticateAdmin);

  fastify.get('/api/admin/analytics/overview', { preHandler: [requireRole('MODERATOR')] }, async (_request, reply) => {
    const result = await getOverview();
    return reply.send(result);
  });

  fastify.get('/api/admin/analytics/registrations', { preHandler: [requireRole('MODERATOR')] }, async (request, reply) => {
    const query = request.query as { period?: string; from?: string; to?: string };
    const result = await getRegistrations(query.period ?? 'day', query.from, query.to);
    return reply.send(result);
  });

  fastify.get('/api/admin/analytics/economy', { preHandler: [requireRole('MODERATOR')] }, async (request, reply) => {
    const query = request.query as { period?: string };
    const result = await getEconomyAnalytics(query.period ?? 'day');
    return reply.send(result);
  });

  fastify.get('/api/admin/analytics/games', { preHandler: [requireRole('MODERATOR')] }, async (_request, reply) => {
    const result = await getGamesAnalytics();
    return reply.send(result);
  });

  fastify.get('/api/admin/analytics/referrals', { preHandler: [requireRole('MODERATOR')] }, async (_request, reply) => {
    const result = await getReferralAnalytics();
    return reply.send(result);
  });
}
