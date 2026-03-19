import type { FastifyInstance } from 'fastify';
import { spinPlaySchema, spinTierParamsSchema } from './spin.schema.js';
import { getSpinTiers, playSpin, getSpinLiveWins, getSpinWinners, getSpinPrizes } from './spin.service.js';
import { BadRequestError } from '../../../lib/errors.js';

export default async function spinRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/games/spin/tiers', async (_request, reply) => {
    const result = await getSpinTiers();
    return reply.send(result);
  });

  fastify.post('/api/games/spin/play', async (request, reply) => {
    const parsed = spinPlaySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await playSpin(request.user!, parsed.data.tier, parsed.data.count);
    return reply.send(result);
  });

  fastify.get('/api/games/spin/live-wins', async (_request, reply) => {
    const result = await getSpinLiveWins();
    return reply.send(result);
  });

  fastify.get('/api/games/spin/winners', async (request, reply) => {
    const query = request.query as { page?: string; limit?: string };
    const result = await getSpinWinners(
      parseInt(query.page ?? '1', 10),
      parseInt(query.limit ?? '20', 10),
    );
    return reply.send(result);
  });

  fastify.get('/api/games/spin/prizes/:tier', async (request, reply) => {
    const parsed = spinTierParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      throw new BadRequestError('Invalid tier');
    }
    const result = await getSpinPrizes(parsed.data.tier);
    return reply.send(result);
  });
}
