import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env.js';
import { globalErrorHandler } from './lib/errors.js';
import settingsPlugin from './plugins/settings.js';
import authPlugin from './plugins/auth.js';
import adminAuthPlugin from './plugins/adminAuth.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import fishingRoutes from './modules/fishing/fishing.routes.js';
import userRoutes from './modules/user/user.routes.js';
import cardsRoutes from './modules/shop/cards/cards.routes.js';
import boostersRoutes from './modules/shop/boosters/boosters.routes.js';
import spinRoutes from './modules/games/spin/spin.routes.js';
import rouletteRoutes from './modules/games/roulette/roulette.routes.js';
import brunosRideRoutes from './modules/games/brunos-ride/brunos-ride.routes.js';
import tasksRoutes from './modules/tasks/tasks.routes.js';
import friendsRoutes from './modules/friends/friends.routes.js';
import dailyComboRoutes from './modules/daily-combo/daily-combo.routes.js';
import dailyActivityRoutes from './modules/daily-activity/daily-activity.routes.js';
import withdrawalsRoutes from './modules/withdrawals/withdrawals.routes.js';
import starsRoutes from './modules/stars/stars.routes.js';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes.js';
import adminAuthRoutes from './modules/admin/admin-auth.routes.js';
import adminUsersRoutes from './modules/admin/admin-users.routes.js';
import adminGameRoutes from './modules/admin/admin-game.routes.js';
import adminEconomyRoutes from './modules/admin/admin-economy.routes.js';
import adminContentRoutes from './modules/admin/admin-content.routes.js';
import adminAnalyticsRoutes from './modules/admin/admin-analytics.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Global error handler
  fastify.setErrorHandler(globalErrorHandler);

  // Plugins
  await fastify.register(cors, {
    origin: [env.WEB_APP_URL, 'http://localhost:5173'],
    credentials: true,
  });

  await fastify.register(helmet);

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Swagger (dev only)
  if (env.NODE_ENV !== 'production') {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: "Bruno's Fishing Adventure API",
          version: '1.0.0',
          description: 'Backend API for the Telegram Mini-App fishing game',
        },
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/api/docs',
    });
  }

  // App plugins
  await fastify.register(settingsPlugin);
  await fastify.register(authPlugin);
  await fastify.register(adminAuthPlugin);

  // Routes
  await fastify.register(authRoutes);
  await fastify.register(fishingRoutes);
  await fastify.register(userRoutes);
  await fastify.register(cardsRoutes);
  await fastify.register(boostersRoutes);
  await fastify.register(spinRoutes);
  await fastify.register(rouletteRoutes);
  await fastify.register(brunosRideRoutes);
  await fastify.register(tasksRoutes);
  await fastify.register(friendsRoutes);
  await fastify.register(dailyComboRoutes);
  await fastify.register(dailyActivityRoutes);
  await fastify.register(withdrawalsRoutes);
  await fastify.register(starsRoutes);
  await fastify.register(leaderboardRoutes);
  await fastify.register(adminAuthRoutes);
  await fastify.register(adminUsersRoutes);
  await fastify.register(adminGameRoutes);
  await fastify.register(adminEconomyRoutes);
  await fastify.register(adminContentRoutes);
  await fastify.register(adminAnalyticsRoutes);

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Next reset time
  fastify.get('/next-reset-time', async () => {
    const now = new Date();
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return {
      nextResetAt: nextReset.toISOString(),
      timeRemaining: nextReset.getTime() - now.getTime(),
    };
  });

  return fastify;
}
