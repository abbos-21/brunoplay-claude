import prisma from '../../prisma.js';
import { env } from '../../config/env.js';
import type { User, Language } from '@prisma/client';

export async function getUserProfile(user: User) {
  return user;
}

export async function updateUserSettings(
  userId: number,
  data: { language?: Language; musicEnabled?: boolean },
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return { language: updated.language, musicEnabled: updated.musicEnabled };
}

export function getAppInfo() {
  return {
    supportLink: env.SUPPORT_LINK ?? '',
    newsChannel: env.NEWS_CHANNEL ?? '',
    faqUrl: env.FAQ_URL ?? '',
  };
}
