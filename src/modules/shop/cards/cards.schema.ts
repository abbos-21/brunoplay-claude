import { z } from 'zod';

export const upgradeCardParamsSchema = z.object({
  cardName: z.enum(['COIN_CAPACITY', 'MINING_RATE']),
});

export type UpgradeCardParams = z.infer<typeof upgradeCardParamsSchema>;
