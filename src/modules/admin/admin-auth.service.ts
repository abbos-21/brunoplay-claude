import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma.js';
import { env } from '../../config/env.js';
import { JWT_EXPIRY } from '../../config/constants.js';
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
} from '../../lib/errors.js';
import type { Admin, AdminRole } from '@prisma/client';
import type { AdminJwtPayload } from '../../types/index.js';

const SALT_ROUNDS = 12;

function signToken(admin: Admin): string {
  const payload: AdminJwtPayload = {
    id: admin.id,
    username: admin.username,
    role: admin.role,
  };
  return jwt.sign(payload, env.ADMIN_JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export async function login(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const token = signToken(admin);

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
  };
}

export async function register(
  username: string,
  password: string,
  role: AdminRole,
) {
  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    throw new ConflictError('Admin with this username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return { admin };
}

export async function getMe(admin: Admin) {
  return {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    createdAt: admin.createdAt.toISOString(),
  };
}

export async function changePassword(
  admin: Admin,
  currentPassword: string,
  newPassword: string,
) {
  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) {
    throw new BadRequestError('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError('New password must be different from current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedPassword },
  });

  return { message: 'Password changed successfully' };
}
