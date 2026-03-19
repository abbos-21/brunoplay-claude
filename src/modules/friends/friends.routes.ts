import type { FastifyInstance } from 'fastify';
import { friendsListQuerySchema } from './friends.schema.js';
import { getInviteLink, getFriendsStats, getFriendsList, getRewardDetails } from './friends.service.js';

export default async function friendsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/friends/invite-link', async (request, reply) => {
    const result = getInviteLink(request.user!);
    return reply.send(result);
  });

  fastify.get('/api/friends/stats', async (request, reply) => {
    const result = await getFriendsStats(request.user!);
    return reply.send(result);
  });

  fastify.get('/api/friends/list', async (request, reply) => {
    const parsed = friendsListQuerySchema.safeParse(request.query);
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
    const result = await getFriendsList(request.user!.id, page, limit);
    return reply.send(result);
  });

  fastify.get('/api/friends/reward-details', async (_request, reply) => {
    const result = await getRewardDetails();
    return reply.send(result);
  });
}
