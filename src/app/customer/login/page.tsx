'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookies from 'js-cookie';
import {
  MapPin,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Award,
  BadgeCheck,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FormInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Please enter your registered mobile or email'),
  password: z.string().min(1, 'Password is required'),
});

type CustomerLoginValues = z.infer<typeof loginSchema>;

export default function CustomerLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerLoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const handleFillDemo = () => {
    setValue('identifier', 'rajesh.sharma@example.com');
    setValue('password', 'customer123');
    setError(null);
  };

  const onSubmit = async (data: CustomerLoginValues) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Invalid credentials');
        return;
      }

      Cookies.set('customer_token', json.token, { expires: 14, path: '/' });
      toast.success(`Welcome back, ${json.customer.fullName}!`);
      router.push('/customer/dashboard');
    } catch {
      setError('An error occurred during sign in');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* ─── Left Side: Institutional REITs Leadership & Trust Showcase (Desktop) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#142B4A] via-[#1a3860] to-[#2563EB] text-white p-12 xl:p-16 flex-col justify-between overflow-hidden select-none">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                Land<span className="text-blue-300"> Investment</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-blue-200/80">
                Co-Investment &amp; Rental Returns Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center: CEO Leadership & Parallel Venture Card */}
        <div className="relative z-10 my-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/25 text-blue-200 text-xs font-bold border border-blue-400/30">
            <Building2 className="w-4 h-4 text-blue-300" />
            <span>REITs PARALLEL VENTURE</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Institutional Land Due Diligence for Retail Co-Investors
            </h1>
            <p className="text-sm text-blue-100/85 leading-relaxed font-normal">
              A specialized fractional land co-investment platform founded in parallel by the leadership of India&apos;s premier REITs institutional management group.
            </p>
          </div>

          {/* CEO Profile Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-md bg-slate-800">
                <img
                  src="https://res.cloudinary.com/krqi4jml/image/upload/v1794810507/land-investment/leadership/iml6rglrvhfcygv8yjks.jpg"
                  alt="Dr. Arvind V. Ramanathan - Founder & Managing Director"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/ceo-reits.jpg';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white shadow-xs">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="font-bold text-white text-base tracking-tight truncate">
                Dr. Arvind V. Ramanathan
              </h3>
              <p className="text-xs font-semibold text-blue-200">
                Founder &amp; Managing Director • REITs Asset Group
              </p>
              <p className="text-xs text-blue-100/80 leading-snug pt-1 italic">
                &ldquo;We parallelly established Land Investment to extend our ₹1,200Cr+ institutional due diligence directly to retail investors with registered legal deeds.&rdquo;
              </p>
            </div>
          </div>

          {/* Track Record Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <div className="text-xl font-black text-white">15+ Yrs</div>
              <div className="text-[10px] text-blue-200/80 font-medium mt-0.5">REITs Track Record</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <div className="text-xl font-black text-emerald-300">₹1,200Cr+</div>
              <div className="text-[10px] text-blue-200/80 font-medium mt-0.5">Assets Governed</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <div className="text-xl font-black text-blue-300">100%</div>
              <div className="text-[10px] text-blue-200/80 font-medium mt-0.5">Clear Legal Deeds</div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-blue-200/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bank-Grade Encryption • Audited UTR • Lawyer-Vetted Title Deeds</span>
        </div>
      </div>

      {/* ─── Right Side: Customer Sign In Form ─────────────────────── */}
      <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#142B4A] to-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-[#142B4A]">
                Land<span className="text-[#2563EB]"> Investment</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500">
              Customer Co-Investment &amp; Rental Yield Portal
            </p>
          </div>

          <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#142B4A] tracking-tight">
                Customer Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered mobile or email and password to access your land portfolio
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                label="Email or Mobile Number"
                placeholder="e.g. rajesh@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                {...register('identifier')}
                error={errors.identifier?.message}
                required
              />

              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password')}
                error={errors.password?.message}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full font-bold shadow-md shadow-blue-500/20"
                >
                  Sign In to Investor Account <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>

            {/* Demo Customer Quick-Fill */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Demo Investor</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    rajesh.sharma@example.com / customer123
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillDemo}
                  className="text-xs h-8 px-2.5 bg-white border-slate-300 hover:bg-blue-50 hover:text-blue-700 font-semibold"
                >
                  Quick Fill
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
              <p>
                New investor?{' '}
                <Link href="/signup" className="font-bold text-[#2563EB] hover:underline">
                  Create an account
                </Link>
              </p>
              <p className="pt-2 border-t border-slate-100">
                <Link href="/admin/login" className="text-slate-400 hover:text-slate-600">
                  Are you an administrator? Switch to Admin Login →
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile REITs Leadership Trust Banner (shown on mobile below login card) */}
          <div className="lg:hidden mt-6 bg-gradient-to-br from-[#142B4A] via-[#1a3860] to-[#2563EB] rounded-2xl p-4 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold">
                <Building2 className="w-3 h-3" />
                <span>REITs PARALLEL INITIATIVE</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Verified Title
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden ring-1 ring-white/30 shrink-0 bg-slate-800">
                <img
                  src="https://res.cloudinary.com/krqi4jml/image/upload/v1794810507/land-investment/leadership/iml6rglrvhfcygv8yjks.jpg"
                  alt="Dr. Arvind V. Ramanathan"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/ceo-reits.jpg';
                  }}
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-white truncate">Dr. Arvind V. Ramanathan</h4>
                <p className="text-[10px] text-blue-200 font-medium truncate">Founder &amp; MD • REITs Asset Group</p>
                <p className="text-[10px] text-slate-300">15+ Yrs Track Record • ₹1,200Cr+ Governed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
