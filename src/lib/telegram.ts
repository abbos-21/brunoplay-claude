import { validate, parse } from '@tma.js/init-data-node';
import { env } from '../config/env.js';

export interface TelegramUserData {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  languageCode: string;
  isBot: boolean;
}

export function validateInitData(initData: string): TelegramUserData {
  validate(initData, env.BOT_TOKEN, { expiresIn: 86400 });

  const parsed = parse(initData);

  if (!parsed.user) {
    throw new Error('No user data in initData');
  }

  const user = parsed.user as Record<string, unknown>;

  return {
    telegramId: String(user.id),
    username: String(user.username ?? ''),
    firstName: String(user.firstName ?? ''),
    lastName: String(user.lastName ?? ''),
    languageCode: String(user.languageCode ?? 'en'),
    isBot: Boolean(user.isBot ?? false),
  };
}
