import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';
import type { AdminJwtPayload } from '../types/index.js';
import type { AdminRole } from '@prisma/client';

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function requireRole(minimumRole: AdminRole) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    const admin = request.admin;
    if (!admin) {
      throw new UnauthorizedError('Admin not authenticated');
    }
    if (ROLE_HIERARCHY[admin.role] < ROLE_HIERARCHY[minimumRole]) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

async function adminAuthPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    'authenticateAdmin',
    async function (request: FastifyRequest, _reply: FastifyReply) {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.slice(7);
      let payload: AdminJwtPayload;

      try {
        payload = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminJwtPayload;
      } catch {
        throw new UnauthorizedError('Invalid or expired admin token');
      }

      const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
      if (!admin) {
        throw new UnauthorizedError('Admin not found');
      }

      request.admin = admin;
    },
  );
}

export default fp(adminAuthPlugin, { name: 'adminAuth' });

declare module 'fastify' {
  interface FastifyInstance {
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
