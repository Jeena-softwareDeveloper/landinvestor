'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Award,
  Info,
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
  const [withdrawalNotice, setWithdrawalNotice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Request Payout Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [amount, setAmount] = useState<number>(5000);
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
        if (wJson.withdrawalNotice) setWithdrawalNotice(wJson.withdrawalNotice);
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

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const available = stats.availableWithdrawalBalance || 0;
    if (amount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }
    if (amount > available) {
      toast.error(`Amount exceeds available balance of ${formatCurrency(available)}`);
      return;
    }

    const tierLimit = tierInfo?.maxWithdrawalLimit;
    if (tierLimit && amount > tierLimit) {
      toast.error(
        `Amount exceeds your ${tierInfo?.tierName || 'Current Tier'} withdrawal limit of ${formatCurrency(tierLimit)} (${tierInfo?.withdrawalLimitPercentage || 15}% of active investment).`
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
          customerNotes: notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Withdrawal request failed');
        setSubmitting(false);
        return;
      }

      toast.success('Withdrawal request submitted! Admin review in progress.');
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

  const availableBalance = stats.availableWithdrawalBalance || 0;
  const maxAllowedLimit = Math.min(
    availableBalance,
    tierInfo?.maxWithdrawalLimit || availableBalance
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">Returns &amp; Payouts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your accrued commercial lease yields and disburse funds to your verified bank/UPI.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="font-bold shadow-sm"
          onClick={() => setShowRequestModal(true)}
          disabled={availableBalance < 500}
        >
          <Wallet className="w-4 h-4 mr-1.5" /> Request Return Withdrawal
        </Button>
      </div>

      {/* ─── Trustworthy Important Notice & Tier-Based Limit Banner ─── */}
      <div className="bg-gradient-to-r from-[#142B4A] via-[#1a3860] to-[#0f2139] border border-blue-500/30 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {tierInfo?.tierName || 'Bronze Investor'} Tier
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SEBI REITs Governance Verified
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Important Policy: Withdrawal Limits Scaled to Active Investment</span>
            </h3>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              {withdrawalNotice ||
                'In accordance with institutional property trust liquidity governance, withdrawal limits per disbursement cycle are calculated based on your total active invested capital to safeguard uninterrupted commercial tenant lease operations.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-xs text-blue-200">
              <span>Active Investment: <strong className="text-white">{formatCurrency(tierInfo?.totalInvested || stats.totalInvested || 0)}</strong></span>
              <span>•</span>
              <span>Allowed Limit ({tierInfo?.withdrawalLimitPercentage || 15}%): <strong className="text-emerald-400">{formatCurrency(tierInfo?.maxWithdrawalLimit || 5000)}</strong></span>
              <span>•</span>
              <span>Turnaround: <strong className="text-white">{tierInfo?.payoutSlaHours || 72}h SLA</strong></span>
            </div>
          </div>

          <div className="shrink-0 bg-white/10 rounded-xl p-4 border border-white/15 text-left lg:text-right space-y-1">
            <div className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">
              Maximum Allowed per Request
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatCurrency(maxAllowedLimit)}
            </div>
            <p className="text-[11px] text-slate-300">
              Award: <strong className="text-amber-300">{tierInfo?.awardTitle || 'Bronze Co-Investor'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Accrued Rental Yield
          </span>
          <div className="text-2xl font-black text-[#142B4A]">
            {formatCurrency(stats.totalAccruedReturns || 0)}
          </div>
          <p className="text-[11px] text-slate-400">Total calculated returns across all contracts</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Returns Disbursed
          </span>
          <div className="text-2xl font-black text-purple-600">
            {formatCurrency(stats.totalReturnsPaid || 0)}
          </div>
          <p className="text-[11px] text-slate-400">Credited to your bank or UPI destination</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available Withdrawal Balance
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(availableBalance)}
          </div>
          <p className="text-[11px] text-slate-400">Ready for payout request</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#142B4A]">Withdrawal Requests &amp; History</h3>
          <span className="text-xs text-slate-400">{withdrawals.length} Total Requests</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No withdrawal requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Requested Amount</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reference / UTR</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((w: any) => (
                  <tr key={w._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {formatDate(w.requestDate || w.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#142B4A]">
                      {formatCurrency(w.requestedAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {w.paymentMethod === 'upi' ? (
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                          UPI: {w.paymentDetails?.upiId || w.upiId || 'Primary UPI'}
                        </span>
                      ) : (
                        <span className="text-[11px]">
                          Bank: {w.paymentDetails?.bankDetails?.bankName || 'NEFT'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          w.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : w.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {w.status === 'paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {w.paymentReference || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {w.customerNotes || w.rejectionReason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Withdrawal Modal */}
      {showRequestModal && (
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Request Rental Yield Withdrawal"
          description={`Available Balance: ${formatCurrency(availableBalance)} • Max Allowed: ${formatCurrency(maxAllowedLimit)}`}
        >
          <form onSubmit={handleRequestPayout} className="space-y-4 pt-2">
            <FormInput
              label="Withdrawal Amount (₹)"
              type="number"
              step="500"
              min={500}
              max={maxAllowedLimit}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              helperText={`Minimum: ₹500 • Max per ${tierInfo?.tierName || 'Current Tier'}: ${formatCurrency(maxAllowedLimit)}`}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disbursement Destination
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  Direct UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  Bank NEFT / IMPS
                </button>
              </div>
            </div>

            <FormInput
              label="Withdrawal Purpose / Remarks (Optional)"
              placeholder="e.g. Monthly rental yield distribution"
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
                className="font-bold"
              >
                Confirm Withdrawal
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
