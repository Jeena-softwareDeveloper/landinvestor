'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Percent,
  FileCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IInvestment } from '@/types';

export default function InvestmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [investment, setInvestment] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestment = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/investments/${id}`);
      const json = await res.json();
      if (json.success) {
        setInvestment(json.investment);
        setReturns(json.returns || []);
      } else {
        toast.error(json.message || 'Investment not found');
        router.push('/investments');
      }
    } catch {
      toast.error('Failed to load investment details');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchInvestment();
  }, [fetchInvestment]);

  if (loading || !investment) {
    return <LoadingSpinner text="Loading investment contract..." className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Investment Allocation #${investment._id.toString().slice(-6).toUpperCase()}`}
        description={`Contract with ${investment.customerId?.fullName} for ${investment.landId?.name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Investments', href: '/investments' },
          { label: `Allocation Details` },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/customers/${investment.customerId?._id}`}>
              <Button variant="outline">View Investor</Button>
            </Link>
            <Link href={`/lands/${investment.landId?._id}`}>
              <Button variant="outline">View Land</Button>
            </Link>
          </div>
        }
      />

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Invested Principal
          </span>
          <h3 className="text-2xl font-bold text-[#142B4A]">
            {formatCurrency(investment.amount)}
          </h3>
          <p className="text-xs text-slate-400">
            Ownership share: {(investment.investmentPercentage || 0).toFixed(2)}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Daily Accrual
          </span>
          <h3 className="text-2xl font-bold text-emerald-600">
            {formatCurrency(investment.dailyAccruedReturn || 0)}
          </h3>
          <p className="text-xs text-slate-400">Rate: {investment.returnRate}%/day</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Accrued Yield
          </span>
          <h3 className="text-2xl font-bold text-blue-600">
            {formatCurrency(investment.totalAccruedReturn || 0)}
          </h3>
          <p className="text-xs text-slate-400">Accumulated returns</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Contract Status
          </span>
          <div className="pt-1">
            <StatusBadge status={investment.status} />
          </div>
          <p className="text-xs text-slate-400 mt-1">Tenure: {investment.duration} Months</p>
        </div>
      </div>

      {/* Information Cards (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Customer Information
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-800">
                {investment.customerId?.fullName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Customer ID</span>
              <span className="font-mono text-slate-800">{investment.customerId?.customerId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Email Address</span>
              <span className="text-slate-800">{investment.customerId?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mobile Number</span>
              <span className="text-slate-800">{investment.customerId?.mobile}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">UPI ID</span>
              <span className="font-mono text-slate-800">
                {investment.customerId?.upiId || 'Not registered'}
              </span>
            </div>
          </div>
        </div>

        {/* Land Property Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Land Asset Particulars
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Property Name</span>
              <span className="font-semibold text-slate-800">{investment.landId?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Survey Number</span>
              <span className="font-mono text-slate-800">{investment.landId?.surveyNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Land Valuation</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(investment.landId?.totalValue || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contract Start Date</span>
              <span className="text-slate-800">{formatDate(investment.startDate)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Payment Reference / UTR</span>
              <span className="font-mono text-slate-800 font-medium">
                {investment.paymentReference}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Return Calculation History */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#142B4A]">Recent Daily Return Records</h3>
            <p className="text-xs text-slate-500">
              Accrued rental yield ledger for this investment allocation
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700">
            {returns.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Return Rate</th>
                <th className="py-3 px-4 text-right">Yield Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returns.length > 0 ? (
                returns.map((ret: any) => (
                  <tr key={ret._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700">{formatDate(ret.date)}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {formatCurrency(ret.investmentAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {ret.returnRate}%/day
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatCurrency(ret.dailyReturnAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={ret.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No return accrual entries yet. Run daily returns calculation from the Daily
                    Returns module.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
