import { getBot } from './bot.js';

export async function checkIfUserIsSubscribed(
  channelUsername: string,
  telegramId: string,
): Promise<boolean> {
  const bot = getBot();
  if (!bot) return false;

  try {
    const member = await bot.api.getChatMember(channelUsername, parseInt(telegramId, 10));
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch {
    return false;
  }
}
