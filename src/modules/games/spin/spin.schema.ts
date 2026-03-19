import { z } from 'zod';

export const spinPlaySchema = z.object({
  tier: z.enum(['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5']),
  count: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]),
});

export type SpinPlayBody = z.infer<typeof spinPlaySchema>;

export const spinTierParamsSchema = z.object({
  tier: z.enum(['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5']),
});
