'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerPaymentScreen({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Countdown timer in seconds (default 15 mins)
  const [timeLeft, setTimeLeft] = useState<number>(900);

  // UTR submission state
  const [utr, setUtr] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/customer/payments/${orderId}`);
        const json = await res.json();
        if (json.success && json.order) {
          setOrder(json.order);
          if (json.order.utr) {
            setUtr(json.order.utr);
            setSubmittedSuccess(true);
          }

          // Compute remaining seconds from expiresAt
          if (json.order.expiresAt) {
            const exp = new Date(json.order.expiresAt).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((exp - now) / 1000));
            setTimeLeft(remaining);
          }
        }
      } catch (err) {
        console.error('Failed to load payment order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleCopyUpi = () => {
    if (!order?.assignedUpiString) return;
    navigator.clipboard.writeText(order.assignedUpiString);
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utr.trim().toUpperCase();
    if (!cleanUtr || cleanUtr.length < 6) {
      toast.error('Please enter a valid 12-digit UPI Transaction / UTR Reference number');
      return;
    }

    try {
      setSubmittingUtr(true);
      const res = await fetch(`/api/customer/payments/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: cleanUtr,
          customerNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to submit UTR reference');
        setSubmittingUtr(false);
        return;
      }

      setSubmittedSuccess(true);
      toast.success('Payment reference submitted! Verification in progress.');
      setOrder((prev: any) => ({ ...prev, status: 'submitted', utr: cleanUtr }));
    } catch {
      toast.error('An error occurred during submission');
    } finally {
      setSubmittingUtr(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-slate-800">Payment Order Not Found</h3>
        <p className="text-xs text-slate-500">The requested order does not exist or has expired.</p>
        <Link href="/customer/lands">
          <Button variant="outline" size="sm">
            ← Return to Lands
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>

      {/* Main Payment Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Header Strip */}
        <div className="bg-[#142B4A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">
              Authorized Escrow UPI Collection
            </span>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>{formatCurrency(order.amount)}</span>
            </h1>
            <p className="text-xs text-blue-200/80">
              Parcel: <strong>{order.landId?.name}</strong> • Order ID:{' '}
              <span className="font-mono">{order.orderId}</span>
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-blue-200 block uppercase font-bold">Expires in</span>
              <span className="text-sm font-mono font-bold tracking-wider">{timerDisplay}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Status Ribbon */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="font-semibold text-slate-700">Order Payment Status:</span>
            <span
              className={`font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                order.status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'submitted'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Two-Column Payment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Dynamic QR Code */}
            <div className="text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Scan with Any UPI App (GPay, PhonePe, Paytm, BHIM)
              </span>

              <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                <img
                  src={order.qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Exact Amount: <strong>{formatCurrency(order.amount)}</strong> is auto-embedded.
              </p>
            </div>

            {/* Right: Assigned Merchant UPI Details */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Assigned Merchant Escrow Name
                </span>
                <span className="text-base font-extrabold text-[#142B4A]">
                  {order.assignedUpiName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold uppercase mb-1">
                  Assigned Merchant UPI ID
                </span>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm text-[#142B4A] font-bold">
                  <span className="flex-1 truncate">{order.assignedUpiString}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy UPI ID"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Direct UPI App Trigger Buttons (Mobile Only) */}
              <div className="pt-2 space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Pay Directly via UPI App
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a href={order.upiUri} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold h-10 border-slate-300">
                      Open UPI App
                    </Button>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="w-full text-xs font-bold h-10 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy UPI ID</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── UTR Reference Submission Form ─────────────────────── */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#142B4A]">
                Submit 12-Digit Bank Reference (UTR) Number
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              After sending money from your bank or UPI app, paste the 12-digit UTR / UPI Transaction Reference below.
              Our accounts team will verify the merchant bank statement and activate your investment contract.
            </p>

            {submittedSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>UTR Reference Registered: {order.utr || utr}</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Transaction is currently in <strong>Verification</strong> state. You can monitor its approval on your customer dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitUtr} className="space-y-4">
                <FormInput
                  label="UPI Transaction ID / 12-Digit UTR Number"
                  placeholder="e.g. 401568912301"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  helperText="Found in your GPay / PhonePe / Paytm payment receipt details"
                  required
                />

                <FormInput
                  label="Payment Notes (Optional)"
                  placeholder="e.g. Paid via HDFC Account ending in 7890"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  loading={submittingUtr}
                  className="w-full font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Payment Reference for Verification
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

