import { z } from 'zod';

export const purchaseBoosterParamsSchema = z.object({
  type: z.enum(['MINING_BOOST_1_5X', 'AUTO_MINING']),
});

export type PurchaseBoosterParams = z.infer<typeof purchaseBoosterParamsSchema>;
