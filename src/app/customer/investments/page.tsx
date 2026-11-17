'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/utils';
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
            Active fractional investment contracts and verified returns.
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
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md transition-shadow"
            >
              {/* Top / Left: Land Image & Name Only */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                  <img
                    src={
                      inv.landId?.coverImage ||
                      (inv.landId?.images && inv.landId?.images[0]) ||
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop'
                    }
                    alt={inv.landId?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#142B4A] leading-snug">
                    {inv.landId?.name}
                  </h3>
                </div>
              </div>

              {/* Bottom / Right: 3 Clean Stats (Invested Amount, Monthly Rent, Duration) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 text-xs text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0">
                <div>
                  <span className="text-slate-400 text-[10px] sm:text-xs block font-medium">Invested Amount</span>
                  <strong className="text-sm sm:text-base text-[#142B4A] font-black block mt-0.5">
                    {formatCurrency(inv.amount)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] sm:text-xs block font-medium">Monthly Rent</span>
                  <strong className="text-sm sm:text-base text-blue-600 font-black block mt-0.5">
                    {formatCurrency(inv.monthlyAccruedReturn || (inv.amount * 0.08 * 30) / 100)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] sm:text-xs block font-medium">Duration</span>
                  <strong className="text-sm sm:text-base text-emerald-600 font-black block mt-0.5">
                    {inv.duration ? `${inv.duration} Months` : '12 Months'}
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
