import prisma from '../../prisma.js';
import { getSettings } from '../../plugins/settings.js';
import { calculateFishingSync, canStartFishing, type FishingState } from './fishing.engine.js';
import { BadRequestError, ConflictError } from '../../lib/errors.js';
import { calculateLevel } from '../../lib/levelUtils.js';
import { processReferralRewards } from '../../lib/referralReward.js';
import type { User, ActiveBooster } from '@prisma/client';

async function getBoosterMultiplier(userId: number): Promise<{
  multiplier: number;
  activeBooster: ActiveBooster | null;
}> {
  const now = new Date();
  const booster = await prisma.activeBooster.findFirst({
    where: {
      userId,
      type: 'MINING_BOOST_1_5X',
      expiresAt: { gt: now },
    },
    orderBy: { expiresAt: 'desc' },
  });

  return {
    multiplier: booster ? booster.multiplier : 1.0,
    activeBooster: booster,
  };
}

async function hasAutoMining(userId: number): Promise<boolean> {
  const now = new Date();
  const booster = await prisma.activeBooster.findFirst({
    where: {
      userId,
      type: 'AUTO_MINING',
      expiresAt: { gt: now },
    },
  });
  return !!booster;
}

export async function startFishing(user: User) {
  const state: FishingState = {
    isFishing: user.isFishing,
    fishingStartedAt: user.fishingStartedAt,
    tankCoins: user.tankCoins,
    tankCapacity: user.tankCapacity,
    miningRate: user.miningRate,
    boosterMultiplier: 1.0,
  };

  const check = canStartFishing(state);
  if (!check.allowed) {
    throw new ConflictError(check.reason);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      isFishing: true,
      fishingStartedAt: new Date(),
      tankCoins: 0,
    },
  });

  await prisma.action.create({
    data: {
      userId: user.id,
      type: 'FISHING_START',
    },
  });

  return {
    isFishing: updated.isFishing,
    fishingStartedAt: updated.fishingStartedAt,
    tankCapacity: updated.tankCapacity,
    miningRate: updated.miningRate,
  };
}

export async function collectFishing(user: User) {
  if (!user.isFishing) {
    throw new BadRequestError('Not currently fishing');
  }

  const settings = await getSettings();
  const { multiplier } = await getBoosterMultiplier(user.id);
  const autoMining = await hasAutoMining(user.id);

  const result = await prisma.$transaction(async (tx) => {
    const freshUser = await tx.user.findUniqueOrThrow({ where: { id: user.id } });

    const state: FishingState = {
      isFishing: freshUser.isFishing,
      fishingStartedAt: freshUser.fishingStartedAt,
      tankCoins: freshUser.tankCoins,
      tankCapacity: freshUser.tankCapacity,
      miningRate: freshUser.miningRate,
      boosterMultiplier: multiplier,
    };

    const calc = calculateFishingSync(state, new Date(), settings.fishingDurationSeconds);

    const updateData: Record<string, unknown> = {
      coins: { increment: calc.newTankCoins },
      totalCoinsEarned: { increment: calc.newTankCoins },
      tankCoins: 0,
      isFishing: autoMining,
      fishingStartedAt: autoMining ? new Date() : null,
    };

    const updated = await tx.user.update({
      where: { id: user.id },
      data: updateData,
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'FISHING_COLLECT',
        data: JSON.stringify({
          coinsCollected: calc.newTankCoins,
          autoRestarted: autoMining,
        }),
      },
    });

    const newLevel = calculateLevel(updated.coinCapacityLevel, updated.miningRateLevel);
    if (newLevel !== updated.level) {
      await tx.user.update({
        where: { id: user.id },
        data: { level: newLevel },
      });
      await processReferralRewards(user.id, newLevel, tx);
    }

    return {
      coinsCollected: calc.newTankCoins,
      newBalance: updated.coins + calc.newTankCoins,
      autoRestarted: autoMining,
    };
  });

  return result;
}

export async function getFishingStatus(user: User) {
  const settings = await getSettings();
  const { multiplier, activeBooster } = await getBoosterMultiplier(user.id);

  const state: FishingState = {
    isFishing: user.isFishing,
    fishingStartedAt: user.fishingStartedAt,
    tankCoins: user.tankCoins,
    tankCapacity: user.tankCapacity,
    miningRate: user.miningRate,
    boosterMultiplier: multiplier,
  };

  const calc = calculateFishingSync(state, new Date(), settings.fishingDurationSeconds);

  return {
    isFishing: user.isFishing,
    fishingStartedAt: user.fishingStartedAt?.toISOString() ?? null,
    tankCoins: calc.newTankCoins,
    tankCapacity: user.tankCapacity,
    miningRate: user.miningRate,
    effectiveMiningRate: user.miningRate * multiplier,
    fishingComplete: calc.fishingComplete,
    activeBooster: activeBooster
      ? { type: activeBooster.type, expiresAt: activeBooster.expiresAt.toISOString() }
      : null,
  };
}

export async function syncFishing(user: User) {
  if (!user.isFishing) {
    return getFishingStatus(user);
  }

  const settings = await getSettings();
  const { multiplier, activeBooster } = await getBoosterMultiplier(user.id);

  const state: FishingState = {
    isFishing: user.isFishing,
    fishingStartedAt: user.fishingStartedAt,
    tankCoins: user.tankCoins,
    tankCapacity: user.tankCapacity,
    miningRate: user.miningRate,
    boosterMultiplier: multiplier,
  };

  const calc = calculateFishingSync(state, new Date(), settings.fishingDurationSeconds);

  await prisma.user.update({
    where: { id: user.id },
    data: { tankCoins: calc.newTankCoins },
  });

  return {
    isFishing: user.isFishing,
    fishingStartedAt: user.fishingStartedAt?.toISOString() ?? null,
    tankCoins: calc.newTankCoins,
    tankCapacity: user.tankCapacity,
    miningRate: user.miningRate,
    effectiveMiningRate: user.miningRate * multiplier,
    fishingComplete: calc.fishingComplete,
    activeBooster: activeBooster
      ? { type: activeBooster.type, expiresAt: activeBooster.expiresAt.toISOString() }
      : null,
  };
}
