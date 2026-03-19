import type { FastifyInstance } from 'fastify';
import { checkTaskParamsSchema } from './tasks.schema.js';
import { getTasks, checkTask } from './tasks.service.js';
import { BadRequestError } from '../../lib/errors.js';

export default async function tasksRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/api/tasks', async (request, reply) => {
    const result = await getTasks(request.user!);
    return reply.send(result);
  });

  fastify.post('/api/tasks/:taskId/check', async (request, reply) => {
    const parsed = checkTaskParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      throw new BadRequestError('Invalid task ID');
    }
    const result = await checkTask(request.user!, parsed.data.taskId);
    return reply.send(result);
  });
}
