import type { User, Admin } from '@prisma/client';

export interface JwtPayload {
  id: number;
  telegramId: string;
}

export interface AdminJwtPayload {
  id: number;
  username: string;
  role: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
    admin?: Admin;
  }
}
