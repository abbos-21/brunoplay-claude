import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../plugins/adminAuth.js';
import { BadRequestError } from '../../lib/errors.js';
import {
  updateSettingsSchema,
  updateCardValuesSchema,
  updateReferralRewardsSchema,
  updateSpinTiersSchema,
  updateRouletteSchema,
  updateEconomySchema,
  updateBoostersSchema,
  updateComboRewardsSchema,
  updateLoginStreakRewardsSchema,
} from './admin.schema.js';
import {
  getSettingsData,
  updateSettings,
  updateCardValues,
  updateReferralRewards,
  updateSpinTiers,
  updateRoulette,
  updateEconomy,
  updateBoosters,
  updateComboRewards,
  updateLoginStreakRewards,
} from './admin-game.service.js';

export default async function adminGameRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticateAdmin);

  fastify.get(
    '/api/admin/settings',
    { preHandler: [requireRole('MODERATOR')] },
    async (_request, reply) => {
      const result = await getSettingsData();
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateSettingsSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateSettings(parsed.data, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/card-values',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateCardValuesSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateCardValues(parsed.data.cardUpgradeValues, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/referral-rewards',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateReferralRewardsSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateReferralRewards(parsed.data.referralRewards, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/spin-tiers',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateSpinTiersSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateSpinTiers(parsed.data.spinTiers, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/roulette',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateRouletteSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateRoulette(parsed.data, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/economy',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateEconomySchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateEconomy(parsed.data, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/boosters',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateBoostersSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateBoosters(parsed.data.boosterPrices, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/combo-rewards',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateComboRewardsSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateComboRewards(parsed.data.comboRewards, request.admin!, request);
      return reply.send(result);
    },
  );

  fastify.put(
    '/api/admin/settings/login-streak-rewards',
    { preHandler: [requireRole('SUPER_ADMIN')] },
    async (request, reply) => {
      const parsed = updateLoginStreakRewardsSchema.safeParse(request.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.issues[0].message);
      const result = await updateLoginStreakRewards(parsed.data.loginStreakRewards, request.admin!, request);
      return reply.send(result);
    },
  );
}
