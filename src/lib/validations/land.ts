import { z } from 'zod';

export const landSchema = z.object({
  name: z.string().min(2, 'Land name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  surveyNumber: z.string().min(1, 'Survey number is required'),
  totalArea: z.number().positive('Total area must be a positive number'),
  totalValue: z.number().positive('Total land value must be positive'),
  availableInvestment: z.number().min(0, 'Available investment cannot be negative').optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'fully_funded']).default('active'),
  images: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  dailyReturnConfig: z
    .object({
      baseRatePercentage: z.number().min(0).max(100).default(0.1),
      frequency: z.enum(['daily', 'monthly', 'quarterly']).default('daily'),
      payoutDayOfMonth: z.number().min(1).max(31).default(1),
    })
    .optional(),
});

export type LandInput = z.infer<typeof landSchema>;
