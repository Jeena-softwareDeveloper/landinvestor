import { z } from 'zod';

export const investmentSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  landId: z.string().min(1, 'Please select a land'),
  amount: z.number().positive('Investment amount must be greater than 0'),
  startDate: z.string().min(1, 'Start date is required'),
  duration: z.number().int().positive('Duration in months is required'),
  returnRate: z.number().min(0, 'Return rate cannot be negative'),
  paymentReference: z.string().min(1, 'Payment reference/UTR is required'),
  investmentAgreementUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;
