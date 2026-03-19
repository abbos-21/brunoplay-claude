import type { FastifyInstance } from 'fastify';
import { createInvoiceSchema, topupTonSchema } from './stars.schema.js';
import { getStarsBalance, createStarsInvoice, topupWithTon } from './stars.service.js';
import { BadRequestError } from '../../lib/errors.js';

export default async function starsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/stars/balance', async (request, reply) => {
    const result = await getStarsBalance(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/stars/create-invoice', async (request, reply) => {
    const parsed = createInvoiceSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await createStarsInvoice(request.user!, parsed.data.amount);
    return reply.send(result);
  });

  fastify.post('/api/stars/topup-ton', async (request, reply) => {
    const parsed = topupTonSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await topupWithTon(request.user!, parsed.data.amountTon);
    return reply.send(result);
  });
}
