'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle,
  CheckCircle2,
  ShieldCheck,
  Crown,
  Sparkles,
  Check,
  ArrowRight,
  ArrowDownLeft,
  Layers,
  BarChart3,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IWithdrawal } from '@/types';

export default function CustomerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<IWithdrawal[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tierInfo, setTierInfo] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Request Payout Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [amount, setAmount] = useState<number>(25000);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const [wRes, dRes] = await Promise.all([
        fetch('/api/customer/withdrawals'),
        fetch('/api/customer/dashboard'),
      ]);
      const wJson = await wRes.json();
      const dJson = await dRes.json();

      if (wJson.success) {
        setWithdrawals(wJson.withdrawals || []);
        if (wJson.tierInfo) setTierInfo(wJson.tierInfo);
        if (wJson.customerDetails) setCustomerDetails(wJson.customerDetails);
      }
      if (dJson.success) {
        setStats(dJson.stats || {});
        if (dJson.stats?.tierInfo && !tierInfo) {
          setTierInfo(dJson.stats.tierInfo);
        }
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const totalInvested = tierInfo?.totalInvested ?? stats.totalInvested ?? 0;
  const tierName =
    tierInfo?.tierName || tierInfo?.name || stats.tierInfo?.name || stats.tierInfo?.tierName || 'Investor';
  const withdrawalLimitPercentage =
    tierInfo?.withdrawalLimitPercentage ?? stats.tierInfo?.withdrawalLimitPercentage ?? 0;
  const maxTierLimit =
    tierInfo?.maxWithdrawalLimit ?? stats.maxWithdrawalLimit ?? totalInvested;
  const payoutSlaHours = tierInfo?.payoutSlaHours ?? stats.tierInfo?.payoutSlaHours ?? 24;

  const availableBalance =
    stats.availableWithdrawalBalance !== undefined
      ? stats.availableWithdrawalBalance
      : (stats.availableBalance ?? 0);

  const maxAllowedLimit = Math.min(availableBalance, maxTierLimit);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }
    if (amount > availableBalance) {
      toast.error(`Amount exceeds your available balance of ${formatCurrency(availableBalance)}`);
      return;
    }
    if (amount > maxTierLimit) {
      toast.error(
        `Amount exceeds your ${tierName} limit of ${formatCurrency(maxTierLimit)} (${withdrawalLimitPercentage}% of active investment).`
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/customer/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethod,
          customerNotes: notes || 'Rental yield distribution payout',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Withdrawal request failed');
        setSubmitting(false);
        return;
      }

      toast.success(json.message || 'Withdrawal request submitted! Review in progress.');
      setShowRequestModal(false);
      setNotes('');
      fetchWithdrawals();
    } catch {
      toast.error('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 pb-8 font-normal">
      {/* ─── 1. Top 3D Hero Section ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0a4fd8] via-[#125ef0] to-[#1e73fa] shadow-xl p-3 sm:p-5 text-center border border-blue-400/30">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-48 h-48 bg-blue-600/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/images/wallet/wallet-hero-3d.png"
            alt="3D Wallet and Growth Chart"
            className="w-full max-h-56 sm:max-h-64 object-contain mx-auto drop-shadow-2xl select-none"
          />
        </div>
      </div>

      {/* ─── 2. Primary Action Capsule Button ──────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => {
            setAmount(Math.min(25000, maxAllowedLimit > 500 ? maxAllowedLimit : 500));
            setShowRequestModal(true);
          }}
          disabled={availableBalance < 500}
          className="w-full group relative overflow-hidden rounded-2xl sm:rounded-full py-3.5 sm:py-4 px-5 sm:px-7 bg-gradient-to-r from-[#1762ee] via-[#2d77fc] to-[#1762ee] hover:from-[#1357d6] hover:to-[#1357d6] text-white shadow-lg shadow-blue-500/25 border border-blue-300/40 transition-all transform active:scale-[0.99] flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shadow-inner">
              <Wallet className="w-5 h-5 text-white stroke-[1.75]" />
            </div>
            <span className="font-normal sm:font-medium text-sm sm:text-base text-left tracking-normal">
              Request Return Withdrawal
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5 text-white stroke-[1.75]" />
          </div>
        </button>
      </div>

      {/* ─── 3. Dual Metallic Badges (1 Row) ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: Metallic Gold Tier Badge */}
        <div className="relative overflow-hidden rounded-2xl py-3 px-3.5 bg-gradient-to-r from-[#b38322] via-[#e5b342] to-[#ad7c1a] border border-amber-200/80 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#6a4200]/30 flex items-center justify-center border border-amber-200/50 shrink-0">
              <Crown className="w-4 h-4 text-amber-100 stroke-[1.75]" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] sm:text-xs font-normal sm:font-medium text-[#382100] truncate">
                {tierName} Tier
              </div>
              <div className="text-[9px] text-[#4d2f00]/80 font-normal hidden sm:block">
                Priority Allocation
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-100 opacity-90 shrink-0 stroke-[1.75]" />
        </div>

        {/* Right: Metallic Emerald Governance Badge */}
        <div className="relative overflow-hidden rounded-2xl py-3 px-3.5 bg-gradient-to-r from-[#0b8457] via-[#10a870] to-[#08734b] border border-emerald-300/60 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-200/40 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-100 stroke-[1.75]" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] sm:text-xs font-normal sm:font-medium text-white truncate">
                SEBI REITs
              </div>
              <div className="text-[9px] text-emerald-100 font-normal truncate">
                Governance Verified
              </div>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-200 opacity-90 shrink-0 stroke-[1.75]" />
        </div>
      </div>

      {/* ─── 4. 3D Financial Vault Card (Dark Navy) ────────────────────── */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#091526] via-[#0d1e36] to-[#07101e] border border-blue-500/25 shadow-2xl overflow-hidden space-y-5">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top: 3 Parameter Rows on Left + 3D Security Safe on Right */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center relative z-10">
          {/* Left Parameter Rows (7 cols) */}
          <div className="sm:col-span-7 space-y-3">
            {/* Row 1: Active Investment */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <Layers className="w-5 h-5 text-cyan-400 stroke-[1.75]" />
              </div>
              <div className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between backdrop-blur-xs">
                <span className="text-[11px] text-slate-300 font-normal">Active Investment</span>
                <span className="text-xs sm:text-sm font-normal text-white">
                  {formatCurrency(totalInvested)}
                </span>
              </div>
            </div>

            {/* Row 2: Allowed Limit */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <BarChart3 className="w-5 h-5 text-emerald-400 stroke-[1.75]" />
              </div>
              <div className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between backdrop-blur-xs">
                <span className="text-[11px] text-slate-300 font-normal">
                  Allowed Limit ({withdrawalLimitPercentage}%)
                </span>
                <span className="text-xs sm:text-sm font-normal text-emerald-400">
                  {formatCurrency(maxTierLimit)}
                </span>
              </div>
            </div>

            {/* Row 3: SLA Turnaround */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <Calendar className="w-5 h-5 text-purple-400 stroke-[1.75]" />
              </div>
              <div className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between backdrop-blur-xs">
                <span className="text-[11px] text-slate-300 font-normal">Turnaround</span>
                <span className="text-xs sm:text-sm font-normal text-white">
                  {payoutSlaHours}h Instant SLA
                </span>
              </div>
            </div>
          </div>

          {/* Right: 3D Metallic Blue Vault / Safe (5 cols) */}
          <div className="sm:col-span-5 flex items-center justify-center py-1 sm:py-2">
            <div className="relative group">
              <div className="absolute -inset-3 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all pointer-events-none" />
              <img
                src="/images/wallet/vault-3d.png"
                alt="3D Financial Security Safe"
                className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain mx-auto drop-shadow-[0_12px_28px_rgba(0,140,255,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* Bottom Inner Emerald Green Capsule Bar */}
        <div className="relative z-10 rounded-2xl sm:rounded-full p-2.5 sm:px-5 bg-gradient-to-r from-[#03543f] via-[#059669] to-[#047857] border border-emerald-400/60 shadow-[0_4px_25px_rgba(16,185,129,0.35)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-amber-400/20 border-2 border-amber-300/80 flex items-center justify-center shrink-0 shadow-inner">
              <Wallet className="w-5 h-5 text-amber-300 stroke-[1.75]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] sm:text-[11px] font-normal text-emerald-100">
                Available for Instant Withdrawal
              </div>
              <div className="text-2xl sm:text-3xl font-normal text-white tracking-normal drop-shadow-sm">
                {formatCurrency(availableBalance)}
              </div>
            </div>
          </div>

          {/* Right: 3D Gold Coins stack */}
          <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-end">
            <img
              src="/images/wallet/coins-3d.png"
              alt="3D Gold Coins Stack"
              className="h-11 sm:h-13 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      </div>

      {/* ─── 5. Secondary Yield Metric Card ────────────────────────────── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0">
            <img
              src="/images/wallet/hand-coin-3d.png"
              alt="Hand holding coin"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] font-normal text-slate-400 block">
              Total Accrued Rental Yield
            </span>
            <div className="text-xl sm:text-2xl font-normal sm:font-medium text-[#142B4A]">
              {formatCurrency(stats.totalAccruedReturns || 0)}
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              Total verified returns across all parcels
            </span>
          </div>
        </div>
        <div className="shrink-0 hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
          <TrendingUp className="w-6 h-6 stroke-[1.75]" />
        </div>
      </div>

      {/* ─── 6. Recent Disbursements / Withdrawal History (Clean Mobile Card List) ─── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-blue-600 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-normal sm:font-medium text-sm text-[#142B4A]">
                Withdrawal History
              </h3>
              <p className="text-[10px] text-slate-400 font-normal">Recent settlement disbursements</p>
            </div>
          </div>
          <span className="text-[11px] font-normal text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            {withdrawals.length} Records
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
              <Wallet className="w-6 h-6 stroke-[1.75]" />
            </div>
            <p className="text-xs text-slate-400 font-normal">No withdrawal requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {withdrawals.map((w: any) => {
              const isPaid = w.status === 'paid';
              const isRejected = w.status === 'rejected';
              const isProcessing = w.status === 'processing';
              const isBank = w.paymentMethod === 'bank_transfer';
              const destinationName = isBank
                ? (w.paymentDetails?.bankDetails?.bankName || w.bankDetails?.bankName || 'HDFC Bank')
                : (w.paymentDetails?.upiId || w.upiId || 'Primary UPI');

              return (
                <div
                  key={w._id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
                >
                  {/* Left: Destination & Date */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : isRejected
                          ? 'bg-red-50 text-red-600 border border-red-200/60'
                          : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                      }`}
                    >
                      {isPaid ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[1.75]" />
                      ) : (
                        <Clock className="w-5 h-5 stroke-[1.75]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-normal text-xs sm:text-sm text-[#142B4A] truncate flex items-center gap-1.5">
                        <span>{isBank ? 'Bank Transfer' : 'UPI Settlement'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 truncate font-normal">
                          {destinationName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-normal">
                        <span>{formatDate(w.requestDate || w.createdAt)}</span>
                        {w.paymentReference && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100/80 font-normal">
                              Ref: {w.paymentReference}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status Badge */}
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-normal sm:font-medium text-[#142B4A]">
                      {formatCurrency(w.requestedAmount)}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal tracking-normal mt-1 ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-red-100 text-red-800'
                          : isProcessing
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600 stroke-[1.75]" />
                      ) : (
                        <Clock className="w-3 h-3 stroke-[1.75]" />
                      )}
                      <span>{isPaid ? 'Completed' : w.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 7. Request Withdrawal Modal ───────────────────────────────── */}
      {showRequestModal && (
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Request Rental Yield Withdrawal"
          description={`Available Balance: ${formatCurrency(availableBalance)} • Max Allowed: ${formatCurrency(maxAllowedLimit)}`}
        >
          <form onSubmit={handleRequestPayout} className="space-y-4 pt-2">
            <div>
              <FormInput
                label="Withdrawal Amount (₹)"
                type="number"
                step="500"
                min={500}
                max={maxAllowedLimit}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                helperText={`Min: ₹500 • Max per request: ${formatCurrency(maxAllowedLimit)} (${tierName})`}
                required
              />

              {/* Quick Select Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-normal text-slate-400">Quick Select:</span>
                {[5000, 10000, 25000, 50000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={val > maxAllowedLimit}
                    onClick={() => setAmount(val)}
                    className={`px-2.5 py-1 rounded-md text-xs font-normal border transition-all ${
                      amount === val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
                {maxAllowedLimit > 500 && (
                  <button
                    type="button"
                    onClick={() => setAmount(maxAllowedLimit)}
                    className={`px-2.5 py-1 rounded-md text-xs font-normal border transition-all ${
                      amount === maxAllowedLimit
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Max (₹{maxAllowedLimit.toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                Disbursement Destination
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-xl border text-xs font-normal text-left transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#2563EB] bg-blue-50/80 text-[#142B4A] ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-normal text-slate-900">Direct Instant UPI</span>
                    {paymentMethod === 'upi' && <Check className="w-4 h-4 text-blue-600 stroke-[1.75]" />}
                  </div>
                  {customerDetails?.upiId ? (
                    <p className="font-mono text-[11px] text-blue-600 mt-1 truncate font-normal">
                      {customerDetails.upiId}
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 mt-1 truncate font-normal">
                      Not configured (Update in Profile)
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">
                    {customerDetails?.upiId ? 'Verified Primary VPA' : 'Required for UPI settlement'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3.5 rounded-xl border text-xs font-normal text-left transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#2563EB] bg-blue-50/80 text-[#142B4A] ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-normal text-slate-900">Bank NEFT / IMPS</span>
                    {paymentMethod === 'bank_transfer' && <Check className="w-4 h-4 text-blue-600 stroke-[1.75]" />}
                  </div>
                  {customerDetails?.bankDetails?.accountNumber ? (
                    <p className="font-normal text-[11px] text-slate-800 mt-1 truncate">
                      {customerDetails?.bankDetails?.bankName || 'Bank'} ••••
                      {customerDetails.bankDetails.accountNumber.slice(-4)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 mt-1 truncate font-normal">
                      Not configured (Update in Profile)
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">
                    {customerDetails?.bankDetails?.accountNumber ? 'Verified Settlement A/C' : 'Required for NEFT/IMPS'}
                  </span>
                </button>
              </div>
            </div>

            <FormInput
              label="Withdrawal Purpose / Remarks (Optional)"
              placeholder="e.g. Monthly commercial rental distribution"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                loading={submitting}
                className="font-normal bg-blue-600 hover:bg-blue-700 text-white px-5"
              >
                Confirm Withdrawal Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
