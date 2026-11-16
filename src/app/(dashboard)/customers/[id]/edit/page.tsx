'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/select';
import { FormTextarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading';
import { customerSchema, CustomerInput } from '@/lib/validations/customer';

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await fetch(`/api/customers/${id}`);
        const json = await res.json();
        if (json.success && json.customer) {
          const c = json.customer;
          reset({
            fullName: c.fullName,
            mobile: c.mobile,
            email: c.email,
            address: c.address,
            kycStatus: c.kycStatus,
            bankDetails: c.bankDetails || {},
            upiId: c.upiId || '',
            accountStatus: c.accountStatus,
          });
        }
      } catch {
        toast.error('Failed to load customer profile');
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [id, reset]);

  const onSubmit = async (data: CustomerInput) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Customer profile updated successfully!');
        router.push(`/customers/${id}`);
      } else {
        toast.error(json.message || 'Failed to update customer');
      }
    } catch {
      toast.error('Network error during customer update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading customer details..." className="h-96" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Edit Customer Profile"
        description="Update investor KYC verification, banking records, and account status."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Customers', href: '/customers' },
          { label: 'Edit' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              {...register('fullName')}
              error={errors.fullName?.message}
            />

            <FormInput
              label="Mobile Number"
              {...register('mobile')}
              error={errors.mobile?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
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
            rows={2}
            {...register('address')}
            error={errors.address?.message}
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Bank Account & Settlement Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Account Holder Name"
              {...register('bankDetails.accountHolderName')}
            />

            <FormInput
              label="Account Number"
              {...register('bankDetails.accountNumber')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="IFSC Code"
              {...register('bankDetails.ifscCode')}
            />

            <FormInput
              label="Bank Name"
              {...register('bankDetails.bankName')}
            />

            <FormInput
              label="UPI ID"
              {...register('upiId')}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Account Preferences
          </h3>

          <div className="w-full md:w-1/2">
            <FormSelect
              label="Account Status"
              options={[
                { value: 'active', label: 'Active' },
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
