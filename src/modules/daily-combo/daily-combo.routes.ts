import type { FastifyInstance } from 'fastify';
import { submitComboSchema } from './daily-combo.schema.js';
import { getTodayCombo, submitCombo } from './daily-combo.service.js';
import { BadRequestError } from '../../lib/errors.js';

export default async function dailyComboRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/daily-combo/today', async (request, reply) => {
    const result = await getTodayCombo(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/daily-combo/submit', async (request, reply) => {
    const parsed = submitComboSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await submitCombo(request.user!, parsed.data.items);
    return reply.send(result);
  });
}
