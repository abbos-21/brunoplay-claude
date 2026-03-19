import prisma from '../../../prisma.js';
import { getSettings } from '../../../plugins/settings.js';
import { MAX_LEVEL } from '../../../config/constants.js';
import { getCardValue, getNextLevel, type CardUpgradeValues } from './cards.engine.js';
import { calculateLevel } from '../../../lib/levelUtils.js';
import { processReferralRewards } from '../../../lib/referralReward.js';
import { BadRequestError, ConflictError } from '../../../lib/errors.js';
import type { User, CardName } from '@prisma/client';

async function checkRequirements(userId: number, cardName: CardName, level: number) {
  const requirements = await prisma.cardUpgradeRequirement.findMany({
    where: { cardName, level },
  });

  if (requirements.length === 0) return { met: true, requirements: [] };

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      referrals: { select: { id: true } },
      taskCompletions: { select: { id: true } },
    },
  });

  const results = requirements.map((req) => {
    let met = false;
    const value = JSON.parse(req.requirementValue);

    switch (req.requirementType) {
      case 'level':
        met = user.level >= value;
        break;
      case 'referrals':
        met = user.referrals.length >= value;
        break;
      case 'task_count':
        met = user.taskCompletions.length >= value;
        break;
      case 'login_streak':
        met = user.loginStreak >= value;
        break;
      default:
        met = true;
    }

    return {
      type: req.requirementType,
      value,
      met,
      description: req.description,
    };
  });

  return {
    met: results.every((r) => r.met),
    requirements: results,
  };
}

export async function getCards(user: User) {
  const settings = await getSettings();
  const upgradeValues = settings.cardUpgradeValues as unknown as CardUpgradeValues;

  const cards = await Promise.all(
    (['COIN_CAPACITY', 'MINING_RATE'] as const).map(async (name) => {
      const currentLevel =
        name === 'COIN_CAPACITY' ? user.coinCapacityLevel : user.miningRateLevel;
      const currentValue = getCardValue(upgradeValues, name, currentLevel);
      const nextLevel = getNextLevel(currentLevel, MAX_LEVEL);
      const nextValue = nextLevel ? getCardValue(upgradeValues, name, nextLevel) : null;

      let requirements: { type: string; value: unknown; met: boolean; description: string }[] = [];
      let canUpgrade = false;

      if (nextLevel) {
        const reqResult = await checkRequirements(user.id, name, nextLevel);
        requirements = reqResult.requirements;
        canUpgrade = reqResult.met;
      }

      return {
        name,
        currentLevel,
        currentValue,
        nextLevel,
        nextValue,
        requirements,
        canUpgrade,
      };
    }),
  );

  return { cards };
}

export async function upgradeCard(user: User, cardName: 'COIN_CAPACITY' | 'MINING_RATE') {
  const currentLevel =
    cardName === 'COIN_CAPACITY' ? user.coinCapacityLevel : user.miningRateLevel;
  const nextLevel = getNextLevel(currentLevel, MAX_LEVEL);

  if (!nextLevel) {
    throw new BadRequestError('Card is already at max level');
  }

  const reqResult = await checkRequirements(user.id, cardName, nextLevel);
  if (!reqResult.met) {
    throw new BadRequestError('Requirements not met for this upgrade');
  }

  const settings = await getSettings();
  const upgradeValues = settings.cardUpgradeValues as unknown as CardUpgradeValues;
  const newValue = getCardValue(upgradeValues, cardName, nextLevel);

  const result = await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {};

    if (cardName === 'COIN_CAPACITY') {
      updateData.coinCapacityLevel = nextLevel;
      updateData.tankCapacity = newValue;
    } else {
      updateData.miningRateLevel = nextLevel;
      updateData.miningRate = newValue;
    }

    const updated = await tx.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const newLevel2 = calculateLevel(updated.coinCapacityLevel, updated.miningRateLevel);
    let levelChanged = false;

    if (newLevel2 !== updated.level) {
      await tx.user.update({
        where: { id: user.id },
        data: { level: newLevel2 },
      });
      levelChanged = true;
      await processReferralRewards(user.id, newLevel2, tx);
    }

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'UPGRADE_PURCHASED',
        data: JSON.stringify({ cardName, newLevel: nextLevel, newValue }),
      },
    });

    return {
      card: { name: cardName, newLevel: nextLevel, newValue },
      user: { level: levelChanged ? newLevel2 : updated.level },
    };
  });

  return result;
}
