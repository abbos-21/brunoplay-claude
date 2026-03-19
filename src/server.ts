import { env } from './config/env.js';
import { buildApp } from './app.js';
import { disconnectPrisma } from './prisma.js';
import { createBot, startBot, stopBot } from './bot/bot.js';
import { startCronJobs, stopCronJobs } from './jobs/scheduler.js';

async function main() {
  const app = await buildApp();

  // Start Telegram bot
  let bot: ReturnType<typeof createBot> | null = null;
  try {
    bot = createBot();
    await startBot(bot);
  } catch (error) {
    app.log.warn(`Failed to start Telegram bot: ${error}`);
  }

  // Start cron jobs
  startCronJobs();

  // Start server
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server started on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);

    // Stop accepting new requests
    await app.close();

    // Stop bot
    if (bot) {
      try {
        await stopBot(bot);
      } catch {
        // Ignore bot stop errors
      }
    }

    // Stop cron jobs
    stopCronJobs();

    // Disconnect database
    await disconnectPrisma();

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
