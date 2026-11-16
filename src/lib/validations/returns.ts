import { z } from 'zod';

export const calculateReturnsSchema = z.object({
  date: z.string().min(1, 'Calculation date is required'),
  landId: z.string().optional(),
  overrideRate: z.number().min(0).max(100).optional(),
});

export const updateReturnStatusSchema = z.object({
  returnIds: z.array(z.string()).min(1, 'At least one return ID must be provided'),
  status: z.enum(['accrued', 'verified', 'paid']),
});

export type CalculateReturnsInput = z.infer<typeof calculateReturnsSchema>;
export type UpdateReturnStatusInput = z.infer<typeof updateReturnStatusSchema>;

