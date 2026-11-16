'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Wallet,
  Building,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CreditCard,
  ExternalLink,
  Award,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerDashboardPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/customer/dashboard');
        if (!res.ok) {
          router.replace('/customer/login');
          return;
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          router.replace('/customer/login');
        }
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
        router.replace('/customer/login');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentInvestments = data?.recentInvestments || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-4 pb-12">
      {/* ─── REITs CEO Trust Banner (Ultra-Compact: Exactly 3 Lines) ─── */}
      <div className="bg-gradient-to-r from-[#142B4A] via-[#173359] to-[#10243e] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-white shadow-md relative overflow-hidden">
        {/* Subtle architectural glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-row items-center gap-3 sm:gap-4 relative z-10">
          {/* Left: Compact CEO Portrait matching 3-line height */}
          <div className="shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-blue-400/40 shadow-sm bg-slate-800">
              <img
                src="https://res.cloudinary.com/krqi4jml/image/upload/v1794810507/land-investment/leadership/iml6rglrvhfcygv8yjks.jpg"
                alt="Dr. Arvind V. Ramanathan"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/ceo-reits.jpg';
                }}
              />
            </div>
          </div>

          {/* Right: EXACTLY 3 Clean Lines */}
          <div className="flex-1 min-w-0 space-y-0.5">
            {/* Line 1: CEO Name & Prominent Gold Pill */}
            <div className="flex flex-wrap items-center gap-1.5 leading-none">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Dr. Arvind V. Ramanathan
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] sm:text-[10px] font-black tracking-wide uppercase">
                <Award className="w-3 h-3 text-amber-400 shrink-0" />
                REITs Founder &amp; CEO
              </span>
            </div>

            {/* Line 2: Role, Governance & Group */}
            <p className="text-[11px] sm:text-xs font-semibold text-blue-300 truncate leading-tight">
              Founder &amp; MD • Premier REITs Asset Management Group (₹1,200Cr+ Governed)
            </p>

            {/* Line 3: Parallel Initiative Core Understanding */}
            <p className="text-[11px] sm:text-xs text-blue-100 font-medium truncate leading-tight">
              Founded in parallel to provide retail investors 100% clear legal deeds &amp; commercial yields.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Top Statistics Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invested */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Invested</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#142B4A]">
            {formatCurrency(stats.totalInvested || 0)}
          </div>
          <p className="text-[11px] text-slate-400">Across {stats.activeInvestmentsCount || 0} active parcels</p>
        </div>

        {/* Accrued Returns */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Accrued Returns</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {formatCurrency(stats.totalAccruedReturns || 0)}
          </div>
          <p className="text-[11px] text-slate-400">Total verified rental earnings</p>
        </div>

        {/* Returns Paid */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Returns Paid Out</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#142B4A]">
            {formatCurrency(stats.totalReturnsPaid || 0)}
          </div>
          <p className="text-[11px] text-slate-400">Disbursed to Bank/UPI</p>
        </div>

        {/* Available Withdrawal Balance */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Available for Payout</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {formatCurrency(stats.availableWithdrawalBalance || 0)}
          </div>
          <p className="text-[11px] text-slate-400">Ready for instant payout request</p>
        </div>
      </div>

      {/* ─── Investor Recognition, Awards & Rewards (Bronze -> Diamond) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#142B4A]">
                  Investor Recognition &amp; Rewards
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                  {stats.tierInfo?.name || 'Bronze Investor'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Award: <strong className="text-slate-800">{stats.tierInfo?.awardTitle || 'Bronze Co-Investor Medal'}</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Withdrawal Limit</span>
            <div className="text-base sm:text-lg font-black text-emerald-600">
              {formatCurrency(stats.maxWithdrawalLimit || 5000)}{' '}
              <span className="text-xs font-semibold text-slate-500">
                ({stats.tierInfo?.withdrawalLimitPercentage || 15}% of active investment)
              </span>
            </div>
          </div>
        </div>

        {/* Tier Rewards Description */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-800">
              Active Tier Rewards: <span className="font-normal">{stats.tierInfo?.rewardsDescription || 'Base tier unlocked on first investment. 100% legal title deeds.'}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Turnaround: <strong>{stats.tierInfo?.payoutSlaHours || 72}h SLA</strong> • Daily Bonus Yield: <strong>+{stats.tierInfo?.dailyBonusRate || 0}%/day</strong>
            </p>
          </div>
        </div>

        {/* Next Tier Upgrade Progress */}
        {stats.nextTier && (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                Progress to <strong className="text-blue-700">{stats.nextTier.name}</strong> ({formatCurrency(stats.nextTier.minInvestment)})
              </span>
              <span className="font-bold text-[#142B4A]">{stats.nextTierProgress || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.nextTierProgress || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Invest {formatCurrency(Math.max(0, stats.nextTier.minInvestment - (stats.totalInvested || 0)))} more to unlock {stats.nextTier.name} with {stats.nextTier.withdrawalLimitPercentage}% withdrawal capacity &amp; +{stats.nextTier.dailyBonusRate}% daily bonus!
            </p>
          </div>
        )}
      </div>

      {/* ─── Pending Payment Orders Alert Banner (If Any) ────────── */}
      {recentOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Pending Payment Order Awaiting Your Transfer / UTR</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800">
              {recentOrders[0].status.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-800">
            <div>
              Order ID: <strong className="font-mono">{recentOrders[0].orderId}</strong> • Amount: <strong>{formatCurrency(recentOrders[0].amount)}</strong>
            </div>
            <Link href={`/customer/payments/${recentOrders[0].orderId}`}>
              <Button size="sm" variant="secondary" className="font-bold text-xs">
                Open UPI Payment Screen →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ─── Section: Active Land Investments ────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#142B4A]">Active Land Holdings</h3>
            <p className="text-xs text-slate-400">Your fractional title contracts and surveyed plots</p>
          </div>
          <Link href="/customer/investments">
            <span className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
              View All ({stats.activeInvestmentsCount || 0}) →
            </span>
          </Link>
        </div>

        {recentInvestments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Building className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No Active Investments Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore available land parcels to start co-investing and receiving monthly rental income.
            </p>
            <Link href="/customer/lands">
              <Button size="sm" variant="secondary" className="font-bold">
                Browse Available Lands
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentInvestments.map((inv: any) => (
              <div
                key={inv._id}
                className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200 flex items-start gap-4"
              >
                <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                  <img
                    src={
                      inv.landId?.coverImage ||
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop'
                    }
                    alt={inv.landId?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#142B4A]">{inv.landId?.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Survey: {inv.landId?.surveyNumber}</p>
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Invested</span>
                      <strong className="text-[#142B4A]">{formatCurrency(inv.amount)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Accrued Return</span>
                      <strong className="text-emerald-600">{formatCurrency(inv.totalAccruedReturn || 0)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

