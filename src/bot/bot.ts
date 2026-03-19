import { Bot } from 'grammy';
import { env } from '../config/env.js';
import { setupCommands } from './commands.js';
import { setupPayments } from './payments.js';

let bot: Bot | null = null;

export function createBot(): Bot {
  bot = new Bot(env.BOT_TOKEN);

  setupCommands(bot);
  setupPayments(bot);

  return bot;
}

export function getBot(): Bot | null {
  return bot;
}

export async function startBot(botInstance: Bot): Promise<void> {
  if (env.NODE_ENV === 'production') {
    // Use webhook in production
    // botInstance.api.setWebhook(...)
  }

  botInstance.start({
    onStart: () => {
      console.log('Telegram bot started');
    },
  });
}

export async function stopBot(botInstance: Bot): Promise<void> {
  botInstance.stop();
}
