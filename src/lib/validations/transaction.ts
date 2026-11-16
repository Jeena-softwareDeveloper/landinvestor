import { z } from 'zod';

export const transactionSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  investmentId: z.string().optional(),
  type: z.enum(['deposit', 'return_payment', 'withdrawal', 'refund', 'adjustment']),
  amount: z.number().positive('Amount must be positive'),
  upiId: z.string().optional(),
  upiReference: z.string().min(3, 'Transaction reference/UTR is required'),
  transactionDate: z.string().min(1, 'Transaction date is required'),
  paymentMethod: z.enum(['upi', 'bank_transfer', 'cash', 'cheque']).default('upi'),
  screenshotUrl: z.string().optional(),
  adminNotes: z.string().optional(),
  status: z.enum(['pending', 'verified', 'rejected', 'completed']).default('pending'),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
