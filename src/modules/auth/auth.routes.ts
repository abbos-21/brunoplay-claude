import type { FastifyInstance } from 'fastify';
import { authBodySchema } from './auth.schema.js';
import { authenticateUser } from './auth.service.js';
import { BadRequestError } from '../../lib/errors.js';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/auth', async (request, reply) => {
    const parsed = authBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const { initData, ref } = parsed.data;
    const result = await authenticateUser(initData, ref);

    return reply.send({
      token: result.token,
      user: result.user,
      isNew: result.isNew,
    });
  });
}
