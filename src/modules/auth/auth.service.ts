import jwt from 'jsonwebtoken';
import prisma from '../../prisma.js';
import { env } from '../../config/env.js';
import { JWT_EXPIRY } from '../../config/constants.js';
import { validateInitData, type TelegramUserData } from '../../lib/telegram.js';
import { BadRequestError } from '../../lib/errors.js';
import type { User } from '@prisma/client';

interface AuthResult {
  token: string;
  user: User;
  isNew: boolean;
}

export async function authenticateUser(initData: string, ref?: string): Promise<AuthResult> {
  const telegramUser = validateInitData(initData);

  let user = await prisma.user.findUnique({
    where: { telegramId: telegramUser.telegramId },
  });

  let isNew = false;

  if (!user) {
    isNew = true;
    const createData: Record<string, unknown> = {
      telegramId: telegramUser.telegramId,
      username: telegramUser.username,
      firstName: telegramUser.firstName,
      lastName: telegramUser.lastName,
      languageCode: telegramUser.languageCode,
      isBot: telegramUser.isBot,
      lastLoginAt: new Date(),
    };

    if (ref) {
      const referrerId = parseRef(ref);
      if (referrerId) {
        const referrer = await prisma.user.findFirst({
          where: {
            OR: [{ id: referrerId }, { telegramId: String(referrerId) }],
          },
        });
        if (referrer) {
          createData.referredById = referrer.id;
        }
      }
    }

    user = await prisma.user.create({ data: createData as Parameters<typeof prisma.user.create>[0]['data'] });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: telegramUser.username,
        firstName: telegramUser.firstName,
        lastName: telegramUser.lastName,
        languageCode: telegramUser.languageCode,
        lastLoginAt: new Date(),
      },
    });
  }

  const token = jwt.sign(
    { id: user.id, telegramId: user.telegramId },
    env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY },
  );

  return { token, user, isNew };
}

function parseRef(ref: string): number | null {
  const match = ref.match(/^ref_(\d+)$/);
  if (match) return parseInt(match[1], 10);
  const num = parseInt(ref, 10);
  return isNaN(num) ? null : num;
}
