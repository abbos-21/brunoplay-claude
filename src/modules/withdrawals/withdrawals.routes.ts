import type { FastifyInstance } from 'fastify';
import { createWithdrawalSchema, withdrawalHistoryQuerySchema } from './withdrawals.schema.js';
import { getWithdrawalInfo, createWithdrawal, getWithdrawalHistory } from './withdrawals.service.js';
import { BadRequestError } from '../../lib/errors.js';

export default async function withdrawalsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/withdrawals/info', async (request, reply) => {
    const result = await getWithdrawalInfo(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/withdrawals', async (request, reply) => {
    const parsed = createWithdrawalSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await createWithdrawal(
      request.user!,
      parsed.data.targetAddress,
      parsed.data.amountCoins,
      request,
    );
    return reply.send(result);
  });

  fastify.get('/api/withdrawals/history', async (request, reply) => {
    const parsed = withdrawalHistoryQuerySchema.safeParse(request.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const result = await getWithdrawalHistory(request.user!.id, page, limit);
    return reply.send(result);
  });
}
