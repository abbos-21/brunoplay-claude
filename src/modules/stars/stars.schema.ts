import { z } from 'zod';

export const createInvoiceSchema = z.object({
  amount: z.number().int().positive(),
});

export const topupTonSchema = z.object({
  amountTon: z.number().positive(),
});
