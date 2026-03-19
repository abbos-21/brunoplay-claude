import type { FastifyInstance } from 'fastify';
import { updateSettingsSchema } from './user.schema.js';
import { getUserProfile, updateUserSettings, getAppInfo } from './user.service.js';
import { BadRequestError } from '../../lib/errors.js';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/user/me', async (request, reply) => {
    const user = await getUserProfile(request.user!);
    return reply.send({ user });
  });

  fastify.put('/api/user/settings', async (request, reply) => {
    const parsed = updateSettingsSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await updateUserSettings(request.user!.id, parsed.data);
    return reply.send({ user: result });
  });

  fastify.get('/api/user/app-info', async (request, reply) => {
    const info = getAppInfo();
    return reply.send(info);
  });
}
