import { z } from 'zod';

export const withdrawalSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  requestedAmount: z.number().positive('Withdrawal amount must be greater than 0'),
  upiId: z.string().optional(),
  bankDetails: z
    .object({
      accountHolderName: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
      bankName: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const updateWithdrawalStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'processing', 'paid', 'rejected']),
  paymentReference: z.string().optional(),
  paymentProof: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type UpdateWithdrawalStatusInput = z.infer<typeof updateWithdrawalStatusSchema>;

