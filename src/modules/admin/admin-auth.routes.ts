import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../plugins/adminAuth.js';
import { BadRequestError } from '../../lib/errors.js';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from './admin.schema.js';
import {
  login,
  register,
  getMe,
  changePassword,
} from './admin-auth.service.js';

export default async function adminAuthRoutes(fastify: FastifyInstance) {
  // Public — no auth required
  fastify.post('/api/admin/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }
    const result = await login(parsed.data.username, parsed.data.password);
    return reply.send(result);
  });

  // Requires SUPER_ADMIN
  fastify.post(
    '/api/admin/auth/register',
    {
      preHandler: [fastify.authenticateAdmin, requireRole('SUPER_ADMIN')],
    },
    async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.issues[0].message);
      }
      const result = await register(
        parsed.data.username,
        parsed.data.password,
        parsed.data.role,
      );
      return reply.status(201).send(result);
    },
  );

  // Authenticated admin
  fastify.get(
    '/api/admin/auth/me',
    {
      preHandler: [fastify.authenticateAdmin],
    },
    async (request, reply) => {
      const result = await getMe(request.admin!);
      return reply.send(result);
    },
  );

  // Authenticated admin
  fastify.put(
    '/api/admin/auth/change-password',
    {
      preHandler: [fastify.authenticateAdmin],
    },
    async (request, reply) => {
      const parsed = changePasswordSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.issues[0].message);
      }
      const result = await changePassword(
        request.admin!,
        parsed.data.currentPassword,
        parsed.data.newPassword,
      );
      return reply.send(result);
    },
  );
}
