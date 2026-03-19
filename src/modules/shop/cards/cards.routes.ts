import type { FastifyInstance } from 'fastify';
import { upgradeCardParamsSchema } from './cards.schema.js';
import { getCards, upgradeCard } from './cards.service.js';
import { BadRequestError } from '../../../lib/errors.js';

export default async function cardsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/shop/cards', async (request, reply) => {
    const result = await getCards(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/shop/cards/:cardName/upgrade', async (request, reply) => {
    const parsed = upgradeCardParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      throw new BadRequestError('Invalid card name');
    }
    const result = await upgradeCard(request.user!, parsed.data.cardName);
    return reply.send(result);
  });
}
