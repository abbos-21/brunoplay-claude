import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { Settings } from '@prisma/client';
import prisma from '../prisma.js';
import { SETTINGS_CACHE_TTL_MS } from '../config/constants.js';

let cachedSettings: Settings | null = null;
let cacheExpiry = 0;

export async function getSettings(): Promise<Settings> {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiry) {
    return cachedSettings;
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    throw new Error('Settings not found in database. Run seed script first.');
  }

  cachedSettings = settings;
  cacheExpiry = now + SETTINGS_CACHE_TTL_MS;
  return settings;
}

export function invalidateSettingsCache(): void {
  cachedSettings = null;
  cacheExpiry = 0;
}

async function settingsPlugin(fastify: FastifyInstance) {
  fastify.decorate('getSettings', getSettings);
  fastify.decorate('invalidateSettingsCache', invalidateSettingsCache);
}

export default fp(settingsPlugin, { name: 'settings' });

declare module 'fastify' {
  interface FastifyInstance {
    getSettings: typeof getSettings;
    invalidateSettingsCache: typeof invalidateSettingsCache;
  }
}
