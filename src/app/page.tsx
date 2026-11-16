'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Building2,
  Users2,
  PhoneCall,
  Mail,
  ExternalLink,
  Sparkles,
  Lock,
  Layers,
  HelpCircle,
  Clock,
  Award,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ILand } from '@/types';

export default function PublicLandingPage() {
  const [lands, setLands] = useState<ILand[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    async function loadPublicLands() {
      try {
        const res = await fetch('/api/public/lands');
        const json = await res.json();
        if (json.success && json.lands) {
          setLands(json.lands);
        }
      } catch (err) {
        console.error('Failed to load public lands:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicLands();
  }, []);

  const faqs = [
    {
      q: 'How does fractional land investment work on LandVest Pro?',
      a: 'We identify, legally vet, and acquire prime surveyed land parcels with active agro or commercial leases. You invest alongside other vetted partners into fractional units of the property. All title deeds and survey reports are public and legally registered.',
    },
    {
      q: 'How do UPI payments and merchant rotation work?',
      a: 'When you initiate an investment, our dynamic assignment engine pairs your order with an active, audited institutional merchant escrow account. You receive an instant dynamic QR code and 12-digit UTR confirmation workflow.',
    },
    {
      q: 'Are returns guaranteed?',
      a: 'No. In full compliance with financial standards, LandVest Pro does not claim speculative guaranteed returns. Instead, yields are derived directly from actual underlying tenant lease agreements and audited net distributable income.',
    },
    {
      q: 'What is the minimum investment amount?',
      a: 'Entry starts at just ₹50,000 for agro estates and ₹1,00,000 for commercial logistics corridors, allowing diversified portfolio allocation across multiple surveyed parcels.',
    },
    {
      q: 'When and how are rental returns paid out?',
      a: 'Returns accrue according to the property lease schedule (monthly or quarterly). Verified returns can be withdrawn directly to your bank account or UPI ID with 24-hour turnaround.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* ─── Top Utility Announcement ────────────────────────────── */}
      <div className="bg-[#142B4A] text-slate-300 text-xs py-2 px-4 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              NEW ALLOCATION
            </span>
            <span className="hidden sm:inline">
              Crystal Horizon Industrial Park Sanand open for institutional & retail co-investment.
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/admin/login" className="hover:text-white transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Admin Portal
            </Link>
            <span>•</span>
            <Link href="/customer/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Customer Sign In →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main Navigation Bar ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-[#142B4A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[#142B4A] tracking-tight">
                Land<span className="text-[#2563EB]"> Investment</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Land Investment SaaS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#properties" className="hover:text-[#2563EB] transition-colors">
              Explore Lands
            </a>
            <a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">
              How It Works
            </a>
            <a href="#transparency" className="hover:text-[#2563EB] transition-colors">
              Rental Model
            </a>
            <a href="#faq" className="hover:text-[#2563EB] transition-colors">
              FAQ
            </a>
            <a href="#contact" className="hover:text-[#2563EB] transition-colors">
              Contact
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/customer/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex border-slate-300 text-slate-700 hover:bg-slate-50 font-medium">
                Customer Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="sm" className="font-semibold shadow-sm shadow-blue-500/20 gap-1.5">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-blue-50/30 to-[#F8FAFC]">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Smart Real Estate Fractional Ownership & Yield Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#142B4A] tracking-tight leading-[1.15]">
              Co-Invest in Surveyed Lands.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-blue-800">
                Earn Monthly Rental Income.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Fractional land ownership backed by registered title deeds, verified agro-commercial leases,
              and automated dynamic UPI payment collection. No middlemen, full audit transparency.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base font-bold px-8 shadow-lg shadow-blue-600/25 h-13 gap-2">
                  Start Investing Today <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#properties" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-semibold px-8 h-13 border-slate-300 text-slate-700 hover:bg-white shadow-xs">
                  View Available Lands
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-14 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">100% Clear Title</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Lawyer-vetted survey parcels</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">12% - 16% Target Yield</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Direct from active tenant leases</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Institutional Escrow</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Rotated merchant UPI routing</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Monthly Payouts</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Instant withdrawal to bank/UPI</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Hero Embedded: REITs Leadership Trust Banner ─────── */}
          <div className="mt-14 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-[#142B4A] via-[#1a3860] to-[#0f2139] rounded-3xl p-8 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
              {/* Background architectural glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 lg:gap-10 relative z-10">
                {/* Left: CEO Portrait & Credentials in Same Row */}
                <div className="flex flex-row sm:flex-col items-center sm:items-start text-left shrink-0 gap-4 sm:gap-0">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl sm:rounded-3xl overflow-hidden ring-3 sm:ring-4 ring-blue-500/30 shadow-2xl bg-slate-800">
                      <img
                        src="https://res.cloudinary.com/krqi4jml/image/upload/v1794810507/land-investment/leadership/iml6rglrvhfcygv8yjks.jpg"
                        alt="Dr. Arvind V. Ramanathan - Founder & Managing Director"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/ceo-reits.jpg';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-1 sm:-bottom-3 sm:-right-3 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] sm:text-xs font-bold shadow-lg flex items-center gap-1 sm:gap-1.5 border border-white/20 whitespace-nowrap">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>REITs Founder &amp; CEO</span>
                    </div>
                  </div>

                  <div className="sm:mt-6 space-y-0.5 sm:space-y-1">
                    <h3 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-white">
                      Dr. Arvind V. Ramanathan
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-blue-300">
                      Founder &amp; MD • Premier REITs Asset Management Group
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden xs:block">
                      15+ Years Real Estate Portfolio Governance • Ex-Institutional Fund Board
                    </p>
                  </div>
                </div>

                {/* Right Column: Founder's Parallel Venture Statement & Trust Metrics */}
                <div className="flex-1 min-w-0 space-y-4 text-left">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white">
                    Founded in Parallel by Real Estate Investment Trust (REIT) Leadership
                  </h2>

                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                    &ldquo;Having governed over ₹1,200 Crores in institutional commercial property trusts, I observed that retail investors were routinely exposed to speculative land schemes without legal title verification. We parallelly founded Land Investment to bridge this divide — delivering the exact same institutional-grade lawyer due diligence, registered deed ownership, and transparent commercial lease yields directly to retail co-investors.&rdquo;
                  </p>

                  {/* 3 Trust Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-3 border-t border-white/10">
                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-white/10 text-center">
                      <div className="text-base sm:text-2xl font-black text-white">15+ Yrs</div>
                      <div className="text-[9px] sm:text-xs text-blue-200/80 font-medium mt-1">REITs Track Record</div>
                    </div>
                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-white/10 text-center">
                      <div className="text-base sm:text-2xl font-black text-emerald-400">₹1,200Cr+</div>
                      <div className="text-[9px] sm:text-xs text-blue-200/80 font-medium mt-1">Assets Governed</div>
                    </div>
                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-white/10 text-center">
                      <div className="text-base sm:text-2xl font-black text-blue-400">100%</div>
                      <div className="text-[9px] sm:text-xs text-blue-200/80 font-medium mt-1">Clear Legal Deeds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section: Explore Available Lands ────────────────────── */}
      <section id="properties" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4" /> Vetted Property Portfolio
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B4A] tracking-tight">
              Explore Available Lands
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Surveyed agricultural, commercial, and industrial plots open for fractional investment allocation.
            </p>
          </div>
          <Link href="/signup" className="mt-4 md:mt-0">
            <span className="text-sm font-bold text-[#2563EB] hover:underline flex items-center gap-1">
              View All Properties in Customer App →
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse p-4 space-y-4">
                <div className="bg-slate-200 rounded-xl h-48 w-full" />
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                <div className="h-10 bg-slate-200 rounded-lg w-full mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lands.map((land) => (
              <div
                key={land._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Property Cover Image */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={
                      land.coverImage ||
                      (land.images && land.images[0]) ||
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop'
                    }
                    alt={land.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#142B4A]/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {land.surveyNumber}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                        land.status === 'active'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {land.status === 'active' ? 'Funding Active' : 'Fully Subscribed'}
                    </span>
                  </div>
                  {land.rentalIncomeModel?.projectedAnnualYield && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-blue-900 text-xs font-black px-3 py-1 rounded-lg shadow-sm border border-blue-100 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{land.rentalIncomeModel.projectedAnnualYield}% Projected Yield</span>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#142B4A] tracking-tight group-hover:text-[#2563EB] transition-colors">
                      {land.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {land.location}
                    </p>
                  </div>

                  {/* Allocation Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Funded: {land.investmentPercentage || 0}%</span>
                      <span>Target: {formatCurrency(land.totalValue)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, land.investmentPercentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Min. Investment</span>
                      <span className="font-bold text-[#142B4A]">
                        {formatCurrency(land.minInvestmentAmount || 50000)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Available Allocation</span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(land.availableInvestment)}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link href={`/signup?landId=${land._id}`} className="block pt-2">
                    <Button
                      variant={land.status === 'active' ? 'secondary' : 'outline'}
                      className="w-full font-bold justify-between"
                      disabled={land.status !== 'active'}
                    >
                      <span>{land.status === 'active' ? 'Invest in Parcel' : 'View Sold Out Parcel'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div> task running
                
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Section: How It Works ──────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              Seamless 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B4A] tracking-tight mt-2">
              How Land Investment Works
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              We eliminated bureaucratic hurdles, paperwork delays, and large capital constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-slate-200 relative">
              <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-white flex items-center justify-center text-lg font-bold mb-6 shadow-md shadow-[#142B4A]/20">
                01
              </div>
              <h3 className="text-lg font-bold text-[#142B4A] mb-2">Select Approved Land</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Browse lawyer-vetted agricultural and commercial parcels. Review title deeds, survey maps,
                and signed lease yield projections.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-slate-200 relative">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center text-lg font-bold mb-6 shadow-md shadow-blue-500/20">
                02
              </div>
              <h3 className="text-lg font-bold text-[#142B4A] mb-2">Transfer via Secure Merchant UPI</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our dynamic rotation engine assigns an authorized institutional merchant UPI destination.
                Scan the dynamic QR code and enter your UTR reference.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-slate-200 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold mb-6 shadow-md shadow-emerald-600/20">
                03
              </div>
              <h3 className="text-lg font-bold text-[#142B4A] mb-2">Earn Verified Rental Yields</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Once verified, your contract is active. Monitor daily return accruals on your customer dashboard
                and request payouts directly to your bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section: Rental Income Transparency ────────────────── */}
      <section id="transparency" className="py-20 bg-gradient-to-br from-[#142B4A] via-[#1a3a62] to-[#2563EB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold border border-white/15">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Financial Transparency Mandate</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Actual Rental Income vs. Speculative Promises
              </h2>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                Most platforms lure investors with arbitrary daily percentage guarantees. At LandVest Pro,
                every rupee distributed is backed by signed commercial leases, verified operational expenses,
                and audited Net Distributable Income.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Itemized Rental Ledgers linking income to specific surveyed plots',
                  'Audited operational maintenance and property tax deductions',
                  'Clear separation between Accrued Projections and Paid Bank Distributions',
                  'Strict compliance against routing funds through personal accounts',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-blue-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/signup">
                  <Button variant="secondary" size="lg" className="font-bold bg-white text-[#142B4A] hover:bg-blue-50 shadow-lg">
                    Join Institutional Co-Investors
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mock Financial Audit Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 text-white space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-bold text-base">Net Distributable Yield Formula</h4>
                  <p className="text-xs text-blue-200/70">Certified by Registered Chartered Valuers</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  AUDITED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-blue-200">Gross Agricultural / Logistics Lease:</span>
                  <span className="font-bold text-white">+ ₹42,50,000 / yr</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-blue-200">Operational & Security Expenses:</span>
                  <span className="font-bold text-red-300">- ₹4,20,000 / yr</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-blue-200">Property Tax & Survey Retainer:</span>
                  <span className="font-bold text-red-300">- ₹1,80,000 / yr</span>
                </div>
                <div className="flex justify-between py-3 bg-white/10 rounded-xl px-4 font-bold text-sm text-emerald-300">
                  <span>Net Distributable Customer Income:</span>
                  <span>₹36,50,000 / yr</span>
                </div>
              </div>

              <p className="text-[11px] text-blue-200/60 leading-relaxed italic">
                * Distributed proportionally to all verified fraction holders every month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section: FAQ Accordion ─────────────────────────────── */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B4A] tracking-tight mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Section: Contact & Inquiries ────────────────────────── */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10">
            <div className="text-center max-w-md mx-auto mb-8">
              <h3 className="text-2xl font-bold text-[#142B4A]">Speak with a Land Investment Advisor</h3>
              <p className="text-xs text-slate-500 mt-1">
                Have questions regarding legal deeds, minimum ticket sizes, or institutional onboarding?
              </p>
            </div>

            {contactSubmitted ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900">Inquiry Received</h4>
                <p className="text-xs text-emerald-700">
                  Our wealth manager will reach out within 2 business hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Krishnan"
                    className="w-full text-sm h-11 px-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    className="w-full text-sm h-11 px-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@company.com"
                    className="w-full text-sm h-11 px-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary" size="lg" className="w-full font-bold">
                    Request Property Dossier & Callback
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#142B4A] text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <span className="text-xl font-bold text-white tracking-tight">Land Investment</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart real estate fractionalization and rental income management platform.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-3">Applications</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/" className="hover:text-white">Public Website</Link></li>
                <li><Link href="/customer/dashboard" className="hover:text-white">Customer App</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white">Admin Cockpit</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-3">Compliance</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Survey Title Verification</li>
                <li>RERA Registered Parcellation</li>
                <li>Merchant Escrow UPI Routing</li>
                <li>Audited Net Distributable Yield</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-3">Access Portals</h5>
              <div className="flex flex-col gap-2">
                <Link href="/customer/login">
                  <Button size="sm" variant="outline" className="w-full justify-start text-xs border-slate-700 text-slate-200 hover:bg-slate-800">
                    Customer App Login →
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button size="sm" variant="outline" className="w-full justify-start text-xs border-slate-700 text-slate-200 hover:bg-slate-800">
                    Administrator Login →
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2025 LandVest Pro Technologies. All rights reserved.</p>
            <p>Disclaimer: Real estate co-investments are subject to market risks. Past lease yields are not guarantees of future income.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
