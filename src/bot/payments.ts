import type { Bot } from 'grammy';
import prisma from '../prisma.js';

export function setupPayments(bot: Bot): void {
  bot.on('pre_checkout_query', async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
  });

  bot.on('message:successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    if (!payment) return;

    const payload = payment.invoice_payload;
    const telegramId = String(ctx.from.id);

    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return;

    const amount = payment.total_amount;

    if (payload.startsWith('stars_topup_')) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { starsBalance: { increment: amount } },
        });

        await tx.starsTransaction.create({
          data: {
            userId: user.id,
            amount,
            source: 'telegram_stars',
            comment: `Telegram Stars purchase: ${amount}`,
          },
        });

        await tx.action.create({
          data: {
            userId: user.id,
            type: 'STARS_PURCHASED',
            data: JSON.stringify({ amount, payload }),
          },
        });
      });
    }
  });
}
