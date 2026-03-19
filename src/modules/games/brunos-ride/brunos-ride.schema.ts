import { z } from 'zod';

export const rideClaimSchema = z.object({
  sessionId: z.string().uuid(),
  coins: z.number().int().min(0),
  score: z.number().int().min(0),
});

export type RideClaimBody = z.infer<typeof rideClaimSchema>;
