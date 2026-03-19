import type { FastifyInstance } from 'fastify';
import { startFishing, collectFishing, getFishingStatus, syncFishing } from './fishing.service.js';

export default async function fishingRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/api/fishing/start', async (request, reply) => {
    const result = await startFishing(request.user!);
    return reply.send({ fishing: result });
  });

  fastify.post('/api/fishing/collect', async (request, reply) => {
    const result = await collectFishing(request.user!);
    return reply.send(result);
  });

  fastify.get('/api/fishing/status', async (request, reply) => {
    const result = await getFishingStatus(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/fishing/sync', async (request, reply) => {
    const result = await syncFishing(request.user!);
    return reply.send(result);
  });
}
