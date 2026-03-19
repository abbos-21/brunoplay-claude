import { z } from 'zod';

export const createWithdrawalSchema = z.object({
  targetAddress: z.string().min(1),
  amountCoins: z.number().positive(),
});

export const withdrawalHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateWithdrawalBody = z.infer<typeof createWithdrawalSchema>;
