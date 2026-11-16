'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/select';
import { FormTextarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { transactionSchema, TransactionInput } from '@/lib/validations/transaction';
import { ICustomer, IInvestment } from '@/types';

export default function NewTransactionPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [investments, setInvestments] = useState<IInvestment[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'deposit',
      paymentMethod: 'upi',
      status: 'pending',
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedCustomerId = watch('customerId');

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/customers?limit=100');
        const json = await res.json();
        if (json.success) setCustomers(json.customers);
      } catch {
        toast.error('Failed to load customers');
      }
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    async function loadCustomerInvestments() {
      if (!selectedCustomerId) {
        setInvestments([]);
        return;
      }
      try {
        const res = await fetch(`/api/investments?customerId=${selectedCustomerId}&status=active`);
        const json = await res.json();
        if (json.success) setInvestments(json.investments);
      } catch {
        // quiet
      }
    }
    loadCustomerInvestments();
  }, [selectedCustomerId]);

  const onSubmit = async (data: TransactionInput) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        screenshotUrl: screenshots[0] || undefined,
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Manual transaction entry successfully recorded for verification!');
        router.push('/transactions');
      } else {
        toast.error(json.message || 'Failed to record transaction');
      }
    } catch {
      toast.error('Network error during transaction submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Record Manual Money Transfer"
        description="Submit offline UPI, RTGS, or NEFT bank transfers for admin audit verification."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Transactions', href: '/transactions' },
          { label: 'New Transfer Entry' },
        ]}
      />

      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Anti-Duplicate UTR Protection:</strong>
          Every transaction entry undergoes automatic reference validation against our historical
          database. Entries remain in <strong>Pending</strong> status until verified against your
          primary banking account statement.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Transaction Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Select Customer"
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
              label="Associated Investment Contract (Optional)"
              options={[
                { value: '', label: '-- None / General Account Credit --' },
                ...investments.map((inv: any) => ({
                  value: inv._id,
                  label: `${inv.landId?.name || 'Investment'} (₹${inv.amount.toLocaleString(
                    'en-IN'
                  )})`,
                })),
              ]}
              {...register('investmentId')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              label="Transaction Type"
              options={[
                { value: 'deposit', label: 'Investment Deposit (Inflow)' },
                { value: 'return_payment', label: 'Customer Return Payment (Outflow)' },
                { value: 'withdrawal', label: 'Capital Withdrawal (Outflow)' },
                { value: 'refund', label: 'Refund' },
                { value: 'adjustment', label: 'Ledger Adjustment' },
              ]}
              {...register('type')}
              error={errors.type?.message}
            />

            <FormInput
              label="Transfer Amount (₹)"
              type="number"
              placeholder="500000"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />

            <FormInput
              label="Transaction Date"
              type="date"
              {...register('transactionDate')}
              error={errors.transactionDate?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              label="Payment Method"
              options={[
                { value: 'upi', label: 'UPI Payment' },
                { value: 'bank_transfer', label: 'NEFT / RTGS / IMPS' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'cash', label: 'Cash Receipt' },
              ]}
              {...register('paymentMethod')}
            />

            <FormInput
              label="UPI / Bank Reference (UTR Number)"
              placeholder="e.g. 401568912301"
              {...register('upiReference')}
              error={errors.upiReference?.message}
            />

            <FormInput
              label="Sender UPI ID (Optional)"
              placeholder="e.g. customer@okhdfc"
              {...register('upiId')}
            />
          </div>

          <FormTextarea
            label="Audit Notes & Remarks"
            placeholder="Document statement row number, branch info, or authorization details..."
            rows={2}
            {...register('adminNotes')}
          />
        </div>

        {/* Screenshot Upload */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Payment Proof Screenshot
          </h3>
          <FileUpload
            label="Upload UPI / Bank Receipt"
            description="PNG, JPG, or PDF proof from customer or banking portal"
            value={screenshots}
            onChange={setScreenshots}
          />
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
            Record Transaction Entry
          </Button>
        </div>
      </form>
    </div>
  );
}
