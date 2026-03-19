import type { FastifyInstance } from 'fastify';
import { getDailyActivityStatus, claimDailyActivity } from './daily-activity.service.js';

export default async function dailyActivityRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/daily-activity/status', async (request, reply) => {
    const result = await getDailyActivityStatus(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/daily-activity/claim', async (request, reply) => {
    const result = await claimDailyActivity(request.user!);
    return reply.send(result);
  });
}
