import { z } from 'zod';

export const authBodySchema = z.object({
  initData: z.string().min(1),
  ref: z.string().optional(),
});

export type AuthBody = z.infer<typeof authBodySchema>;
