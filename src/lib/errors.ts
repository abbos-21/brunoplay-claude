import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(message = 'Insufficient balance') {
    super(message, 400, 'INSUFFICIENT_BALANCE');
    this.name = 'InsufficientBalanceError';
  }
}

export function globalErrorHandler(
  error: FastifyError | AppError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const statusCode = 'statusCode' in error ? error.statusCode ?? 500 : 500;
  const code = 'code' in error ? error.code : 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    _request.log.error(error);
  }

  reply.status(statusCode).send({
    success: false,
    error: {
      code,
      message: error.message || 'Internal server error',
    },
  });
}
