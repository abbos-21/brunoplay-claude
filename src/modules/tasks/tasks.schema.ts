import { z } from 'zod';

export const checkTaskParamsSchema = z.object({
  taskId: z.coerce.number().int().positive(),
});

export type CheckTaskParams = z.infer<typeof checkTaskParamsSchema>;
