import { z } from 'zod';

export const updateSettingsSchema = z.object({
  language: z.enum(['EN', 'RU']).optional(),
  musicEnabled: z.boolean().optional(),
});

export type UpdateSettingsBody = z.infer<typeof updateSettingsSchema>;
