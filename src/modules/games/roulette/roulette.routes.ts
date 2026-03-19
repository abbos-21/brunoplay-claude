import type { FastifyInstance } from 'fastify';
import { playRoulette, getRoulettePrizes, getRouletteLiveWins } from './roulette.service.js';

export default async function rouletteRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/api/games/roulette/play', async (request, reply) => {
    const result = await playRoulette(request.user!);
    return reply.send(result);
  });

  fastify.get('/api/games/roulette/prizes', async (_request, reply) => {
    const result = await getRoulettePrizes();
    return reply.send(result);
  });

  fastify.get('/api/games/roulette/live-wins', async (_request, reply) => {
    const result = await getRouletteLiveWins();
    return reply.send(result);
  });
}
