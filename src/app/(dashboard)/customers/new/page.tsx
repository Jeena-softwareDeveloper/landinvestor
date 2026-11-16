'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/select';
import { FormTextarea } from '@/components/ui/textarea';
import { customerSchema, CustomerInput } from '@/lib/validations/customer';

export default function NewCustomerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      kycStatus: 'pending',
      accountStatus: 'active',
    },
  });

  const onSubmit = async (data: CustomerInput) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Customer ${json.customer.customerId} created successfully!`);
        router.push('/customers');
      } else {
        toast.error(json.message || 'Failed to create customer');
      }
    } catch {
      toast.error('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Add New Customer"
        description="Register a new individual or institutional land investor profile."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Customers', href: '/customers' },
          { label: 'New Customer' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              placeholder="e.g. Rajesh Kumar Sharma"
              {...register('fullName')}
              error={errors.fullName?.message}
            />

            <FormInput
              label="Mobile Number"
              placeholder="e.g. 9845012345"
              {...register('mobile')}
              error={errors.mobile?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="e.g. rajesh.sharma@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <FormSelect
              label="KYC Status"
              options={[
                { value: 'pending', label: 'Pending Verification' },
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              {...register('kycStatus')}
              error={errors.kycStatus?.message}
            />
          </div>

          <FormTextarea
            label="Residential / Registered Address"
            placeholder="Full residential address including city, state, pin code..."
            rows={2}
            {...register('address')}
            error={errors.address?.message}
          />
        </div>

        {/* Banking & Settlement Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Bank Account & UPI Settlement Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Account Holder Name"
              placeholder="Name matching bank records"
              {...register('bankDetails.accountHolderName')}
            />

            <FormInput
              label="Bank Account Number"
              placeholder="e.g. 50100234567890"
              {...register('bankDetails.accountNumber')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="IFSC Code"
              placeholder="e.g. HDFC0000053"
              {...register('bankDetails.ifscCode')}
            />

            <FormInput
              label="Bank Name"
              placeholder="e.g. HDFC Bank"
              {...register('bankDetails.bankName')}
            />

            <FormInput
              label="UPI ID"
              placeholder="e.g. user@okhdfcbank"
              {...register('upiId')}
            />
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Account Preferences
          </h3>

          <div className="w-full md:w-1/2">
            <FormSelect
              label="Account Status"
              options={[
                { value: 'active', label: 'Active (Permitted to Invest)' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
              {...register('accountStatus')}
              error={errors.accountStatus?.message}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            className="bg-[#142B4A] hover:bg-[#1a3a62] px-6"
          >
            Register Customer
          </Button>
        </div>
      </form>
    </div>
  );
}

