import type { FastifyInstance } from 'fastify';
import { purchaseBoosterParamsSchema } from './boosters.schema.js';
import { getBoosters, purchaseBooster } from './boosters.service.js';
import { BadRequestError } from '../../../lib/errors.js';

export default async function boostersRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/shop/boosters', async (request, reply) => {
    const result = await getBoosters(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/shop/boosters/:type/purchase', async (request, reply) => {
    const parsed = purchaseBoosterParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      throw new BadRequestError('Invalid booster type');
    }
    const result = await purchaseBooster(request.user!, parsed.data.type);
    return reply.send(result);
  });
}
