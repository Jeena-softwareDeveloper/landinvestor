'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Building,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Layers,
  FileCheck2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/utils';
import { ILand } from '@/types';

export default function CustomerLandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [land, setLand] = useState<ILand | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Invest Modal State
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState<number>(50000);
  const [investing, setInvesting] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    async function loadLand() {
      try {
        const res = await fetch(`/api/public/lands/${id}`);
        const json = await res.json();
        if (json.success && json.land) {
          setLand(json.land);
          setInvestAmount(json.land.minInvestmentAmount || 50000);
          setSelectedImage(json.land.coverImage || (json.land.images && json.land.images[0]) || '');
        }
      } catch (err) {
        console.error('Failed to load land details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLand();
  }, [id]);

  const handleInitiateInvestment = async () => {
    if (!land) return;
    const min = land.minInvestmentAmount || 50000;
    if (investAmount < min) {
      toast.error(`Minimum investment is ${formatCurrency(min)}`);
      return;
    }
    if (investAmount > land.availableInvestment) {
      toast.error(`Amount exceeds available allocation of ${formatCurrency(land.availableInvestment)}`);
      return;
    }

    try {
      setInvesting(true);
      const res = await fetch('/api/customer/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landId: land._id,
          amount: investAmount,
          customerNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to create payment order');
        setInvesting(false);
        return;
      }

      toast.success('Payment order initiated! Directing to UPI payment screen…');
      router.push(json.paymentUrl);
    } catch {
      toast.error('An error occurred during order generation');
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!land) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <Building className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-800">Property Not Found</h3>
        <Link href="/customer/lands">
          <Button variant="outline" size="sm">
            ← Back to Lands
          </Button>
        </Link>
      </div>
    );
  }

  const projectedReturnRate = land.rentalIncomeModel?.projectedAnnualYield || 12;
  const estimatedMonthlyYield = (investAmount * (projectedReturnRate / 100)) / 12;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/customer/lands"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Available Lands
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media & Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual Showcase */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-72 sm:h-96 w-full bg-slate-100 relative">
              <img
                src={
                  selectedImage ||
                  land.coverImage ||
                  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop'
                }
                alt={land.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#142B4A]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                Survey #{land.surveyNumber}
              </div>
            </div>

            {/* Thumbnail Row */}
            {land.images && land.images.length > 1 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3 overflow-x-auto">
                {land.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img ? 'border-[#2563EB] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-[#142B4A]">Property Overview & Zoning</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {land.description ||
                'Prime surveyed land parcel with legal boundaries demarcated and active commercial/agro tenancy.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Land Area</span>
                <strong className="text-slate-800 font-semibold">{land.totalArea.toLocaleString('en-IN')} sq.ft.</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Survey Identification</span>
                <strong className="text-slate-800 font-semibold">{land.surveyNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Property Status</span>
                <strong className="text-emerald-700 capitalize font-semibold">{land.status.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h3 className="text-base font-bold text-[#142B4A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Public Title & Legal Documents</span>
            </h3>
            <p className="text-xs text-slate-500">
              Approved title deeds, clearance certificates, and survey sketch reports.
            </p>

            <div className="space-y-2 pt-2">
              {(land.documents && land.documents.length > 0
                ? land.documents
                : ['Title_Deed_Verification.pdf', 'Survey_Boundaries_Clearance.pdf', 'RERA_Disclosure.pdf']
              ).map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    <span>{doc}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#2563EB]">Verified PDF</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Investment Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-5 sticky top-24">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parcel Value</span>
              <div className="text-2xl font-black text-[#142B4A] mt-0.5">
                {formatCurrency(land.totalValue)}
              </div>
            </div>

            {/* Allocation Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Funded: {land.investmentPercentage || 0}%</span>
                <span>Available: {formatCurrency(land.availableInvestment)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, land.investmentPercentage || 0)}%` }}
                />
              </div>
            </div>

            {/* Yield Highlight Box */}
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-blue-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                  <span>Target Rental Yield</span>
                </span>
                <span className="text-base text-[#2563EB]">{projectedReturnRate}% p.a.</span>
              </div>
              <p className="text-blue-800/80 leading-relaxed text-[11px]">
                Tenant: <strong>{land.rentalIncomeModel?.tenantType || 'Commercial Agro Lease'}</strong> • Distribution: Monthly
              </p>
            </div>

            {/* Ticket Specs */}
            <div className="space-y-2 text-xs text-slate-600 py-2 border-y border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Minimum Ticket:</span>
                <strong className="text-slate-900">{formatCurrency(land.minInvestmentAmount || 50000)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <strong className="text-slate-900">Dynamic Merchant UPI / QR</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payout Periodicity:</span>
                <strong className="text-slate-900">Every 1st of Month</strong>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-blue-600/25"
              disabled={land.status !== 'active' || land.availableInvestment <= 0}
              onClick={() => setShowInvestModal(true)}
            >
              {land.status === 'active' && land.availableInvestment > 0 ? (
                <>
                  Invest Now via UPI <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                'Fully Subscribed'
              )}
            </Button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              * Assigns an authorized merchant escrow UPI account upon order generation.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Invest Now Modal ────────────────────────────────────── */}
      {showInvestModal && (
        <Modal
          isOpen={showInvestModal}
          onClose={() => setShowInvestModal(false)}
          title={`Invest in ${land.name}`}
          description={`Available Allocation: ${formatCurrency(land.availableInvestment)}`}
        >
          <div className="space-y-5 pt-2">
            <div>
              <FormInput
                label="Enter Investment Amount (₹)"
                type="number"
                step="10000"
                min={land.minInvestmentAmount || 50000}
                max={land.availableInvestment}
                value={investAmount}
                onChange={(e) => setInvestAmount(Number(e.target.value))}
                helperText={`Minimum: ${formatCurrency(land.minInvestmentAmount || 50000)} • Available: ${formatCurrency(land.availableInvestment)}`}
                required
              />
            </div>

            {/* Calculator Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Target Annual Yield:</span>
                <span className="font-bold text-slate-900">{projectedReturnRate}% p.a.</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 text-sm pt-1 border-t border-slate-200">
                <span>Estimated Monthly Rental Income:</span>
                <span>{formatCurrency(Math.round(estimatedMonthlyYield))} / mo</span>
              </div>
            </div>

            <div>
              <FormInput
                label="Investor Remarks / Reference (Optional)"
                placeholder="e.g. Self investment from personal savings"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={investing}
                onClick={() => setShowInvestModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={investing}
                onClick={handleInitiateInvestment}
                className="font-bold gap-1.5"
              >
                Generate UPI Order <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

