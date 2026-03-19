import type { FastifyInstance } from 'fastify';
import { leaderboardParamsSchema, leaderboardQuerySchema } from './leaderboard.schema.js';
import { getActiveTournament, getTournamentLeaderboard } from './leaderboard.service.js';
import { BadRequestError } from '../../lib/errors.js';

export default async function leaderboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/tournaments/active', async (_request, reply) => {
    const result = await getActiveTournament();
    return reply.send(result);
  });

  fastify.get('/api/tournaments/:id/leaderboard', async (request, reply) => {
    const params = leaderboardParamsSchema.safeParse(request.params);
    if (!params.success) {
      throw new BadRequestError('Invalid tournament ID');
    }
    const query = leaderboardQuerySchema.safeParse(request.query);
    const { page, limit } = query.success ? query.data : { page: 1, limit: 50 };
    const result = await getTournamentLeaderboard(
      params.data.id,
      request.user!.id,
      page,
      limit,
    );
    return reply.send(result);
  });
}
