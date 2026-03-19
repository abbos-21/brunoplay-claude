import type { FastifyInstance } from 'fastify';
import { rideClaimSchema } from './brunos-ride.schema.js';
import { startRide, claimRide, getRideStatus } from './brunos-ride.service.js';
import { BadRequestError } from '../../../lib/errors.js';

export default async function brunosRideRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/api/games/brunos-ride/start', async (request, reply) => {
    const result = await startRide(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/games/brunos-ride/claim', async (request, reply) => {
    const parsed = rideClaimSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await claimRide(
      request.user!,
      parsed.data.sessionId,
      parsed.data.coins,
      parsed.data.score,
    );
    return reply.send(result);
  });

  fastify.get('/api/games/brunos-ride/status', async (request, reply) => {
    const result = await getRideStatus(request.user!);
    return reply.send(result);
  });
}
