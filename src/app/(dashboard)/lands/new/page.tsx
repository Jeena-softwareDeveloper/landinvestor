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
import { FileUpload } from '@/components/ui/file-upload';
import { landSchema, LandInput } from '@/lib/validations/land';

export default function NewLandPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LandInput>({
    resolver: zodResolver(landSchema),
    defaultValues: {
      status: 'active',
      dailyReturnConfig: {
        baseRatePercentage: 0.1,
        frequency: 'daily',
        payoutDayOfMonth: 1,
      },
    },
  });

  const onSubmit = async (data: LandInput) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        images,
        documents,
      };

      const res = await fetch('/api/lands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Land property registered successfully!');
        router.push('/lands');
      } else {
        toast.error(json.message || 'Failed to add land');
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
        title="Add New Land Property"
        description="Register a new surveyed land parcel for customer investment allocation."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lands', href: '/lands' },
          { label: 'Add New' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Property Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Property Identification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Land Name"
              placeholder="e.g. Green Meadows Agro Estate"
              {...register('name')}
              error={errors.name?.message}
            />

            <FormInput
              label="Survey Number"
              placeholder="e.g. SY-142/2A"
              {...register('surveyNumber')}
              error={errors.surveyNumber?.message}
            />
          </div>

          <FormInput
            label="Location / Full Address"
            placeholder="e.g. Devanahalli, Bengaluru Rural, Karnataka"
            {...register('location')}
            error={errors.location?.message}
          />

          <FormTextarea
            label="Property Description & Lease Potential"
            placeholder="Describe soil quality, road connectivity, existing plantations or rental lease tenants..."
            rows={3}
            {...register('description')}
            error={errors.description?.message}
          />
        </div>

        {/* Financial & Valuation Parameters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Valuation & Capacity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Total Land Area (sq ft)"
              type="number"
              placeholder="43560"
              {...register('totalArea', { valueAsNumber: true })}
              error={errors.totalArea?.message}
            />

            <FormInput
              label="Total Land Value (₹)"
              type="number"
              placeholder="25000000"
              {...register('totalValue', { valueAsNumber: true })}
              error={errors.totalValue?.message}
            />

            <FormSelect
              label="Initial Status"
              options={[
                { value: 'active', label: 'Active (Open for Investment)' },
                { value: 'inactive', label: 'Inactive (Draft / Hold)' },
                { value: 'fully_funded', label: 'Fully Funded' },
              ]}
              {...register('status')}
              error={errors.status?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <FormInput
              label="Configured Daily Return Rate (% per day)"
              type="number"
              step="0.01"
              placeholder="0.25"
              helperText="Returns percentage per day (e.g. 0.25% per day = 7.5% monthly = 90% annual yield)"
              {...register('dailyReturnConfig.baseRatePercentage', { valueAsNumber: true })}
              error={errors.dailyReturnConfig?.baseRatePercentage?.message}
            />

            <FormSelect
              label="Calculation Frequency"
              options={[
                { value: 'daily', label: 'Daily Accrual' },
                { value: 'monthly', label: 'Monthly Summary' },
                { value: 'quarterly', label: 'Quarterly Review' },
              ]}
              {...register('dailyReturnConfig.frequency')}
            />
          </div>
        </div>

        {/* Media & Legal Documentation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Media & Legal Documents
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              label="Land Photographs / Site Images"
              description="Upload aerial or site pictures (PNG, JPG)"
              multiple
              value={images}
              onChange={setImages}
            />

            <FileUpload
              label="Legal Verification & Survey Documents"
              description="Upload Title Deeds, Survey Map, NOC (PDF)"
              multiple
              value={documents}
              onChange={setDocuments}
            />
          </div>
        </div>

        {/* Actions */}
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
            Register Land Property
          </Button>
        </div>
      </form>
    </div>
  );
}

