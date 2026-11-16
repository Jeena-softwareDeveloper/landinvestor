'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Building,
  Calendar,
  ShieldCheck,
  ArrowRight,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IInvestment } from '@/types';

export default function CustomerInvestmentsPage() {
  const [investments, setInvestments] = useState<IInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvestments() {
      try {
        const res = await fetch('/api/customer/investments');
        const json = await res.json();
        if (json.success) {
          setInvestments(json.investments);
        }
      } catch (err) {
        console.error('Failed to load investments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvestments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">My Land Holdings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active fractional investment contracts, legal title references, and accumulated returns.
          </p>
        </div>
        <Link href="/customer/lands">
          <Button variant="secondary" size="sm" className="font-bold">
            Explore More Lands <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Land Investments Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our approved surveyed land listings to start co-investing and earning verified commercial yields.
          </p>
          <Link href="/customer/lands">
            <Button variant="secondary" size="sm" className="font-bold">
              Browse Available Lands
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv: any) => (
            <div
              key={inv._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={
                      inv.landId?.coverImage ||
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop'
                    }
                    alt={inv.landId?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#142B4A]">{inv.landId?.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {inv.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Survey Number: <strong>{inv.landId?.surveyNumber}</strong> • Location:{' '}
                    {inv.landId?.location}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Contract Started: {formatDate(inv.startDate)} • Ref: {inv.paymentReference}
                  </p>
                </div>
              </div>

              {/* Stats Column */}
              <div className="grid grid-cols-3 gap-6 text-xs text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0">
                <div>
                  <span className="text-slate-400 text-[10px] block">Invested Amount</span>
                  <strong className="text-base text-[#142B4A] font-black">{formatCurrency(inv.amount)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Monthly Yield</span>
                  <strong className="text-base text-blue-600 font-black">
                    {formatCurrency(inv.monthlyAccruedReturn || (inv.amount * 0.08 * 30) / 100)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Total Accrued</span>
                  <strong className="text-base text-emerald-600 font-black">
                    {formatCurrency(inv.totalAccruedReturn || 0)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

