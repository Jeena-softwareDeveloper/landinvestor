'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookies from 'js-cookie';
import { MapPin, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';

const signupSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const landId = searchParams.get('landId');

  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [formData, setFormData] = useState<SignupFormValues | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      password: '',
    },
  });

  const onInitSignup = (data: SignupFormValues) => {
    setFormData(data);
    setError(null);
    setStep('otp');
    toast.success(`Verification code sent to +91 ${data.mobile} & ${data.email}`);
  };

  const handleVerifyAndRegister = async () => {
    if (!formData) return;
    if (enteredOtp !== '4829' && enteredOtp.length !== 4) {
      setError('Please enter the 4-digit verification code shown on screen');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/auth/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Registration failed');
        setSubmitting(false);
        return;
      }

      Cookies.set('customer_token', json.token, { expires: 14, path: '/' });
      setStep('success');
      toast.success('Account successfully verified & created!');

      setTimeout(() => {
        if (landId) {
          router.push(`/customer/lands/${landId}`);
        } else {
          router.push('/customer/dashboard');
        }
      }, 1500);
    } catch {
      setError('An error occurred during verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-11 h-11 bg-gradient-to-br from-[#142B4A] to-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-md">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-[#142B4A]">
            Land<span className="text-[#2563EB]"> Investment</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#142B4A] tracking-tight">
          Create Your Investor Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Co-invest in high-yield surveyed agricultural and commercial plots
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit(onInitSignup)} className="space-y-4">
              <FormInput
                label="Full Legal Name"
                placeholder="e.g. Ramesh Krishnan"
                leftIcon={<User className="w-4 h-4" />}
                {...register('fullName')}
                error={errors.fullName?.message}
                required
              />

              <FormInput
                label="Mobile Number"
                type="tel"
                placeholder="10-digit mobile number"
                leftIcon={<Phone className="w-4 h-4" />}
                {...register('mobile')}
                error={errors.mobile?.message}
                required
              />

              <FormInput
                label="Email Address"
                type="email"
                placeholder="ramesh@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                {...register('email')}
                error={errors.email?.message}
                required
              />

              <FormInput
                label="Create Password"
                type="password"
                placeholder="Min. 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                {...register('password')}
                error={errors.password?.message}
                required
              />

              <div className="pt-2">
                <Button type="submit" variant="secondary" size="lg" className="w-full font-bold shadow-md shadow-blue-500/20">
                  Verify & Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Already registered?{' '}
                <Link href="/customer/login" className="font-bold text-[#2563EB] hover:underline">
                  Customer Sign In
                </Link>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#142B4A]">Verify Contact Details</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the verification code sent to <strong>+91 {formData?.mobile}</strong>
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 font-mono">
                <span>Demo Instant Code: </span>
                <span className="font-bold text-sm tracking-widest text-[#2563EB]">4829</span>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="4829"
                  className="w-40 text-center tracking-widest text-2xl font-black py-2.5 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="w-1/3"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  loading={submitting}
                  onClick={handleVerifyAndRegister}
                  className="w-2/3 font-bold"
                >
                  Confirm & Register
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Registration Complete!</h3>
              <p className="text-xs text-slate-500">
                Redirecting to your personalized customer investment portal…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
