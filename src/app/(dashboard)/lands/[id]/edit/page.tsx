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
import { landSchema, LandInput } from '@/lib/validations/land';

export default function EditLandPage({
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
  } = useForm<LandInput>({
    resolver: zodResolver(landSchema),
  });

  useEffect(() => {
    async function loadLand() {
      try {
        const res = await fetch(`/api/lands/${id}`);
        const json = await res.json();
        if (json.success && json.land) {
          reset({
            name: json.land.name,
            location: json.land.location,
            surveyNumber: json.land.surveyNumber,
            totalArea: json.land.totalArea,
            totalValue: json.land.totalValue,
            description: json.land.description || '',
            status: json.land.status,
            dailyReturnConfig: {
              baseRatePercentage: json.land.dailyReturnConfig?.defaultRate || 0.1,
              frequency: 'daily',
              payoutDayOfMonth: 1,
            },
          });
        }
      } catch {
        toast.error('Failed to load land property details');
      } finally {
        setLoading(false);
      }
    }
    loadLand();
  }, [id, reset]);

  const onSubmit = async (data: LandInput) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/lands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Land property updated successfully!');
        router.push(`/lands/${id}`);
      } else {
        toast.error(json.message || 'Failed to update land');
      }
    } catch {
      toast.error('Network error during update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading property details..." className="h-96" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Edit Land Property"
        description="Update valuation parameters, survey records, and status."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lands', href: '/lands' },
          { label: 'Edit' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Property Identification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Land Name"
              {...register('name')}
              error={errors.name?.message}
            />

            <FormInput
              label="Survey Number"
              {...register('surveyNumber')}
              error={errors.surveyNumber?.message}
            />
          </div>

          <FormInput
            label="Location / Full Address"
            {...register('location')}
            error={errors.location?.message}
          />

          <FormTextarea
            label="Property Description"
            rows={3}
            {...register('description')}
            error={errors.description?.message}
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Valuation & Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Total Land Area (sq ft)"
              type="number"
              {...register('totalArea', { valueAsNumber: true })}
              error={errors.totalArea?.message}
            />

            <FormInput
              label="Total Land Value (₹)"
              type="number"
              {...register('totalValue', { valueAsNumber: true })}
              error={errors.totalValue?.message}
            />

            <FormSelect
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'fully_funded', label: 'Fully Funded' },
              ]}
              {...register('status')}
              error={errors.status?.message}
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
