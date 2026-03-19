import prisma from '../../prisma.js';
import { getSettings, invalidateSettingsCache } from '../../plugins/settings.js';
import { extractIp } from '../../lib/ip.js';
import { BadRequestError } from '../../lib/errors.js';
import type { Admin } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

async function createAuditLog(
  admin: Admin,
  action: string,
  details: Record<string, unknown>,
  ip: string,
) {
  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action,
      targetType: 'Settings',
      targetId: '1',
      details: details as Record<string, unknown> as Parameters<typeof prisma.adminAuditLog.create>[0]['data']['details'],
      ip,
    },
  });
}

export async function getSettingsData() {
  const settings = await getSettings();
  return { settings };
}

export async function updateSettings(
  data: Record<string, unknown>,
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();

  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    before[key] = (currentSettings as Record<string, unknown>)[key];
    after[key] = value;
  }

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: data as Parameters<typeof prisma.settings.update>[0]['data'],
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_SETTINGS', { before, after }, ip);

  return { settings: updated };
}

export async function updateCardValues(
  cardUpgradeValues: Record<string, number[]>,
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);

  // Validate monotonically increasing values for each card
  for (const [cardName, values] of Object.entries(cardUpgradeValues)) {
    if (values.length !== 13) {
      throw new BadRequestError(`${cardName} must have exactly 13 values`);
    }
    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i - 1]) {
        throw new BadRequestError(
          `${cardName} values must be monotonically increasing (index ${i}: ${values[i]} < ${values[i - 1]})`,
        );
      }
    }
  }

  const currentSettings = await getSettings();
  const before = currentSettings.cardUpgradeValues;

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: { cardUpgradeValues },
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_CARD_VALUES', { before, after: cardUpgradeValues }, ip);

  return { cardUpgradeValues: updated.cardUpgradeValues };
}

export async function updateReferralRewards(
  referralRewards: Record<string, number>,
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();
  const before = currentSettings.referralRewards;

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: { referralRewards },
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_REFERRAL_REWARDS', { before, after: referralRewards }, ip);

  return { referralRewards: updated.referralRewards };
}

export async function updateSpinTiers(
  spinTiers: unknown[],
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();
  const before = currentSettings.spinTiers;

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: { spinTiers: spinTiers as unknown as Parameters<typeof prisma.settings.update>[0]['data']['spinTiers'] },
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_SPIN_TIERS', { before, after: spinTiers }, ip);

  return { spinTiers: updated.spinTiers };
}

export async function updateRoulette(
  data: { rouletteCostStars: number; roulettePrizes: unknown[] },
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();
  const before = {
    rouletteCostStars: currentSettings.rouletteCostStars,
    roulettePrizes: currentSettings.roulettePrizes,
  };

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: {
      rouletteCostStars: data.rouletteCostStars,
      roulettePrizes: data.roulettePrizes as unknown as Parameters<typeof prisma.settings.update>[0]['data']['roulettePrizes'],
    },
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_ROULETTE', { before, after: data }, ip);

  return {
    rouletteCostStars: updated.rouletteCostStars,
    roulettePrizes: updated.roulettePrizes,
  };
}

export async function updateEconomy(
  data: Record<string, unknown>,
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();

  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    before[key] = (currentSettings as Record<string, unknown>)[key];
    after[key] = value;
  }

  // Validate min <= max for withdrawal limits if both present
  const minWithdrawal =
    (data.minimumCoinWithdrawal as number | undefined) ?? currentSettings.minimumCoinWithdrawal;
  const maxWithdrawal =
    (data.maximumCoinWithdrawal as number | undefined) ?? currentSettings.maximumCoinWithdrawal;
  if (minWithdrawal > maxWithdrawal) {
    throw new BadRequestError('Minimum withdrawal cannot exceed maximum withdrawal');
  }

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: data as Parameters<typeof prisma.settings.update>[0]['data'],
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_ECONOMY', { before, after }, ip);

  return { settings: updated };
}

export async function updateBoosters(
  boosterPrices: Record<string, number>,
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();
  const before = currentSettings.boosterPrices;

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: { boosterPrices },
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_BOOSTER_PRICES', { before, after: boosterPrices }, ip);

  return { boosterPrices: updated.boosterPrices };
}

export async function updateComboRewards(
  comboRewards: Record<string, number>,
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();
  const before = currentSettings.comboRewards;

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: { comboRewards },
  });

  invalidateSettingsCache();

  await createAuditLog(admin, 'UPDATE_COMBO_REWARDS', { before, after: comboRewards }, ip);

  return { comboRewards: updated.comboRewards };
}

export async function updateLoginStreakRewards(
  loginStreakRewards: Record<string, number>,
  admin: Admin,
  request: FastifyRequest,
) {
  const ip = extractIp(request);
  const currentSettings = await getSettings();
  const before = currentSettings.loginStreakRewards;

  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: { loginStreakRewards },
  });

  invalidateSettingsCache();

  await createAuditLog(
    admin,
    'UPDATE_LOGIN_STREAK_REWARDS',
    { before, after: loginStreakRewards },
    ip,
  );

  return { loginStreakRewards: updated.loginStreakRewards };
}
