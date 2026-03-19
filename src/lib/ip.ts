import type { FastifyRequest } from 'fastify';

export function extractIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || '0.0.0.0';
}
