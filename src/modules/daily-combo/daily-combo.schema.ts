import { z } from 'zod';

export const submitComboSchema = z.object({
  items: z
    .array(z.number().int().min(1).max(8))
    .length(4)
    .refine((arr) => new Set(arr).size === 4, { message: 'No duplicate items allowed' }),
});

export type SubmitComboBody = z.infer<typeof submitComboSchema>;
