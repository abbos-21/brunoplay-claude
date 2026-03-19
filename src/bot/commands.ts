import type { Bot } from 'grammy';
import { env } from '../config/env.js';

export function setupCommands(bot: Bot): void {
  bot.command('start', async (ctx) => {
    const payload = ctx.match;
    const webAppUrl = env.WEB_APP_URL;

    const refParam = payload ? `?ref=${payload}` : '';

    await ctx.reply(
      `🎣 Welcome to Bruno's Fishing Adventure!\n\nJoin Bruno the fisherman on an exciting journey. Fish, earn coins, play mini-games, and invite friends!\n\nTap the button below to start playing:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎮 Play Now',
                web_app: { url: `${webAppUrl}${refParam}` },
              },
            ],
          ],
        },
      },
    );
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      `🎣 Bruno's Fishing Adventure - Help\n\n` +
        `🐟 Fishing: Start a fishing session to earn coins over 1 hour\n` +
        `🛒 Shop: Upgrade your gear and buy boosters\n` +
        `🎰 Games: Play Spin, Roulette, or Bruno's Ride\n` +
        `📋 Tasks: Complete tasks for rewards\n` +
        `👥 Friends: Invite friends and earn referral rewards\n` +
        `📅 Daily: Claim daily login rewards and solve the combo\n\n` +
        `Need support? Contact us at ${env.SUPPORT_LINK ?? 'the support channel'}`,
    );
  });
}
