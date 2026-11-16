'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/select';
import { FormTextarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading';
import { investmentSchema, InvestmentInput } from '@/lib/validations/investment';
import { formatCurrency } from '@/lib/utils';
import { ICustomer, ILand } from '@/types';

function NewInvestmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId') || '';
  const preselectedLandId = searchParams.get('landId') || '';

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [lands, setLands] = useState<ILand[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      customerId: preselectedCustomerId,
      landId: preselectedLandId,
      amount: 1000000,
      startDate: new Date().toISOString().split('T')[0],
      duration: 12,
      returnRate: 0.1,
      paymentReference: '',
    },
  });

  const selectedLandId = watch('landId');
  const amount = watch('amount') || 0;
  const returnRate = watch('returnRate') || 0;
  const duration = watch('duration') || 0;

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [custRes, landRes] = await Promise.all([
          fetch('/api/customers?limit=100&accountStatus=active'),
          fetch('/api/lands?limit=100&status=active'),
        ]);

        const [custJson, landJson] = await Promise.all([custRes.json(), landRes.json()]);

        if (custJson.success) setCustomers(custJson.customers);
        if (landJson.success) setLands(landJson.lands);

        if (preselectedCustomerId) setValue('customerId', preselectedCustomerId);
        if (preselectedLandId) setValue('landId', preselectedLandId);
      } catch {
        toast.error('Failed to load customers or land properties');
      }
    }
    loadDropdowns();
  }, [preselectedCustomerId, preselectedLandId, setValue]);

  const currentLand = lands.find((l) => l._id === selectedLandId);
  const landTotalVal = currentLand?.totalValue || 0;
  const investmentPercentage =
  landTotalVal > 0 ? ((amount / landTotalVal) * 100).toFixed(2) : '0.00';
  const dailyReturnProjected = (amount * returnRate) / 100;
  const monthlyReturnProjected = dailyReturnProjected * 30;
  const totalReturnProjected = monthlyReturnProjected * duration;
  const maturityAmountProjected = amount + totalReturnProjected;

  const onSubmit = async (data: InvestmentInput) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Customer investment allocation registered successfully!');
        router.push('/investments');
      } else {
        toast.error(json.message || 'Failed to create investment');
      }
    } catch {
      toast.error('An error occurred during investment allocation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Create Customer Investment Allocation"
        description="Allocate customer funds to a specific surveyed land asset and configure projected lease yields."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Investments', href: '/investments' },
          { label: 'New Allocation' },
        ]}
      />

      {/* Compliance Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Financial & Regulatory Protocol:</strong>
          All return figures configured below are <em>projected rental yields</em> based on
          underlying agricultural lease, commercial lease, or industrial operations. Payouts are
          strictly disbursed after administrative lease revenue verification.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selection Cards */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Target Assets & Customer Selection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Select Investor / Customer"
              options={[
                { value: '', label: '-- Select Customer --' },
                ...customers.map((c) => ({
                  value: c._id,
                  label: `${c.fullName} (${c.customerId})`,
                })),
              ]}
              {...register('customerId')}
              error={errors.customerId?.message}
            />

            <FormSelect
              label="Select Land Property"
              options={[
                { value: '', label: '-- Select Land Property --' },
                ...lands.map((l) => ({
                  value: l._id,
                  label: `${l.name} (Avail: ₹${(l.availableInvestment / 100000).toFixed(1)}L)`,
                })),
              ]}
              {...register('landId')}
              error={errors.landId?.message}
            />
          </div>

          {currentLand && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block">Property Valuation</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(currentLand.totalValue)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Available Capacity</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(currentLand.availableInvestment)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Survey Number</span>
                <span className="font-mono text-slate-700">{currentLand.surveyNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Investment Parameters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Investment Parameters & Terms
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Investment Amount (₹)"
              type="number"
              placeholder="1000000"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />

            <FormInput
              label="Start Date"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />

            <FormInput
              label="Tenure / Duration (Months)"
              type="number"
              placeholder="12"
              {...register('duration', { valueAsNumber: true })}
              error={errors.duration?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Daily Configured Return Rate (%)"
              type="number"
              step="0.01"
              placeholder="0.10"
              {...register('returnRate', { valueAsNumber: true })}
              error={errors.returnRate?.message}
            />

            <FormInput
              label="Payment Reference / UTR Number"
              placeholder="e.g. UPI/401568912301/HDFC"
              {...register('paymentReference')}
              error={errors.paymentReference?.message}
            />
          </div>

          <FormTextarea
            label="Internal Notes / Allocation Memo"
            placeholder="Special contractual conditions, sub-plot earmarking, or banking instructions..."
            rows={2}
            {...register('notes')}
          />
        </div>

        {/* Automatic Real-Time Financial Projection Card */}
        <div className="bg-gradient-to-br from-[#142B4A] to-[#1a3a62] p-6 rounded-xl text-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-bold">Automated Projection Summary</h3>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/80">
              Contract Terms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-300 block mb-1">Asset Ownership Share</span>
              <span className="text-xl font-bold text-white">{investmentPercentage}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">of total land parcel</span>
            </div>

            <div>
              <span className="text-slate-300 block mb-1">Projected Daily Yield</span>
              <span className="text-xl font-bold text-emerald-400">
                {formatCurrency(dailyReturnProjected)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">daily accrual rate</span>
            </div>

            <div>
              <span className="text-slate-300 block mb-1">Projected Monthly Yield</span>
              <span className="text-xl font-bold text-blue-300">
                {formatCurrency(monthlyReturnProjected)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">30-day billing cycle</span>
            </div>

            <div>
              <span className="text-slate-300 block mb-1">Projected Total Returns</span>
              <span className="text-xl font-bold text-amber-300">
                {formatCurrency(totalReturnProjected)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">over {duration} months</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-300">Total Projected Maturity Value:</span>
              <span className="text-2xl font-extrabold text-white ml-2">
                {formatCurrency(maturityAmountProjected)}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full principal + accrued rental yield upon maturity</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            Confirm & Allocate Investment
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewInvestmentPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading investment form..." className="h-96" />}>
      <NewInvestmentContent />
    </Suspense>
  );
}