import { z } from 'zod';

export const leaderboardParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const leaderboardQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
