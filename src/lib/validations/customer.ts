import { z } from 'zod';

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(5, 'Address is required'),
  kycStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  bankDetails: z
    .object({
      accountHolderName: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
      bankName: z.string().optional(),
    })
    .optional(),
  upiId: z.string().optional(),
  accountStatus: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

export type CustomerInput = z.infer<typeof customerSchema>;
