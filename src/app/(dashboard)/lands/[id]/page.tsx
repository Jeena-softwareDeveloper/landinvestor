'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  FileText,
  Users,
  Edit,
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { ILand, IInvestment } from '@/types';

export default function LandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [land, setLand] = useState<ILand | null>(null);
  const [investments, setInvestments] = useState<IInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLandDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/lands/${id}`);
      const json = await res.json();
      if (json.success) {
        setLand(json.land);
        setInvestments(json.investments || []);
      } else {
        toast.error(json.message || 'Land not found');
        router.push('/lands');
      }
    } catch {
      toast.error('Failed to load land details');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchLandDetails();
  }, [fetchLandDetails]);

  if (loading || !land) {
    return <LoadingSpinner text="Loading property details..." className="h-96" />;
  }

  const fundedPercent = Math.min(land.investmentPercentage || 0, 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={land.name}
        description={`Survey Number: ${land.surveyNumber} • ${land.location}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lands', href: '/lands' },
          { label: land.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/investments/new?landId=${land._id}`}>
              <Button
                disabled={land.status === 'fully_funded' || land.availableInvestment <= 0}
                className="bg-[#059669] hover:bg-[#047857]"
              >
                <TrendingUp className="w-4 h-4 mr-1.5" /> Allocate Investment
              </Button>
            </Link>
            <Link href={`/lands/${land._id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-1.5" /> Edit Property
              </Button>
            </Link>
          </div>
        }
      />

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Land Value
          </span>
          <h3 className="text-2xl font-bold text-[#142B4A]">
            {formatCurrency(land.totalValue)}
          </h3>
          <p className="text-xs text-slate-400">Assessed valuation</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Invested
          </span>
          <h3 className="text-2xl font-bold text-emerald-600">
            {formatCurrency(land.totalInvested)}
          </h3>
          <p className="text-xs text-slate-400">{fundedPercent.toFixed(1)}% subscribed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Available Capacity
          </span>
          <h3 className="text-2xl font-bold text-blue-600">
            {formatCurrency(land.availableInvestment)}
          </h3>
          <p className="text-xs text-slate-400">Open for new customer allocations</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Current Status
          </span>
          <div className="pt-1">
            <StatusBadge status={land.status} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {land.status === 'fully_funded'
              ? 'No additional allocations accepted'
              : 'Active property portfolio'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-700">Investment Subscription Progress</span>
          <span className="text-[#2563EB]">{fundedPercent.toFixed(2)}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#2563EB] to-[#059669] h-full rounded-full transition-all duration-500"
            style={{ width: `${fundedPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
          <span>₹0</span>
          <span>Target: {formatCurrency(land.totalValue)}</span>
        </div>
      </div>

      {/* Details Grid: Left side Info, Right side Return Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Property Specifics */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Property Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Total Area</span>
              <span className="font-semibold text-slate-800">
                {formatNumber(land.totalArea)} sq ft ({(land.totalArea / 43560).toFixed(2)} Acres)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block">Survey Number</span>
              <span className="font-mono font-semibold text-slate-800">{land.surveyNumber}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block">Registered Location</span>
              <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {land.location}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block">Created Date</span>
              <span className="font-medium text-slate-800">{formatDate(land.createdAt)}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs text-slate-400 font-medium block mb-1">
              Description & Harvest / Lease Highlights
            </span>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              {land.description || 'No description provided for this land parcel.'}
            </p>
          </div>

          {/* Property Photographs & Gallery */}
          {land.images && land.images.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Property Photographs & Site Views ({land.images.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {land.images.map((img, idx) => (
                  <a
                    key={idx}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group block hover:ring-2 hover:ring-blue-500 transition-all shadow-xs"
                  >
                    <img
                      src={img}
                      alt={`${land.name} photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Legal Documents */}
          {land.documents && land.documents.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Attached Legal & Title Documents
              </span>
              <div className="flex flex-wrap gap-2">
                {land.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Return Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] border-b border-slate-100 pb-2">
            Daily Return Configuration
          </h3>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100/80">
              <span className="text-xs text-amber-800 font-semibold block">
                Base Rental Return Rate
              </span>
              <span className="text-xl font-bold text-[#D97706]">
                {land.dailyReturnConfig?.defaultRate || 0.1}% / day
              </span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Approx. {((land.dailyReturnConfig?.defaultRate || 0.1) * 30).toFixed(1)}% monthly yield
              </p>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Auto Daily Calculation</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Total Active Investors</span>
              <span className="font-semibold text-slate-800">{investments.length}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-500 border border-slate-100 leading-normal">
              <strong>Regulatory Notice:</strong> Land rental returns are variable yields derived
              from actual lease agreements, agricultural harvesting, or industrial warehousing
              rents. They are never treated as guaranteed fixed deposits.
            </div>
          </div>
        </div>
      </div>

      {/* Associated Investors Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#142B4A]">Allocated Investors</h3>
            <p className="text-xs text-slate-500">Customers holding shares in this land asset</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700">
            {investments.length} Investors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Investor Name</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4 text-right">Investment Amount</th>
                <th className="py-3 px-4 text-right">Share (%)</th>
                <th className="py-3 px-4 text-right">Daily Return</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investments.length > 0 ? (
                investments.map((inv: any) => (
                  <tr key={inv._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {inv.customerId?.fullName || 'Investor'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {inv.customerId?.customerId || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                      {(inv.investmentPercentage || 0).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                      {formatCurrency(inv.dailyAccruedReturn || 0)}/day
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(inv.startDate)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No customer investments allocated to this property yet.
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

