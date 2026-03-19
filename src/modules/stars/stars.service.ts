import prisma from '../../prisma.js';
import { getSettings } from '../../plugins/settings.js';
import type { User } from '@prisma/client';

export async function getStarsBalance(user: User) {
  const settings = await getSettings();
  return {
    starsBalance: user.starsBalance,
    topUpOptions: {
      telegramStars: true,
      tonCoin: {
        rate: settings.tonToStarsRate,
        bonusPercent: settings.tonToStarsBonusPercent,
      },
    },
  };
}

export async function createStarsInvoice(user: User, amount: number) {
  // This would create a Telegram Stars invoice via the bot
  // Placeholder: return a mock invoice link
  const invoiceLink = `tg://invoice?amount=${amount}&user=${user.telegramId}`;
  return { invoiceLink };
}

export async function topupWithTon(user: User, amountTon: number) {
  const settings = await getSettings();
  const baseStars = Math.floor(amountTon * settings.tonToStarsRate * 100);
  const bonusStars = Math.floor(baseStars * (settings.tonToStarsBonusPercent / 100));
  const totalStars = baseStars + bonusStars;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { starsBalance: { increment: totalStars } },
    });

    await tx.starsTransaction.create({
      data: {
        userId: user.id,
        amount: totalStars,
        source: 'ton_topup',
        comment: `TON top-up: ${amountTon} TON → ${totalStars} stars (${bonusStars} bonus)`,
      },
    });

    await tx.action.create({
      data: {
        userId: user.id,
        type: 'STARS_TOPPED_UP',
        data: JSON.stringify({ amountTon, baseStars, bonusStars, totalStars }),
      },
    });
  });

  return {
    starsReceived: baseStars,
    bonusStars,
    newBalance: user.starsBalance + totalStars,
  };
}
