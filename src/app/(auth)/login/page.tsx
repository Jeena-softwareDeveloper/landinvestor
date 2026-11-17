"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  MapPin,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FormInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Invalid credentials. Please try again.");
        return;
      }

      Cookies.set("token", result.token, { expires: 7, path: "/" });
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Left Side - Branding & Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#142B4A] via-[#1a3a62] to-[#2563EB] items-center justify-center p-12 select-none">
        {/* Glow & Blurred Accents */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2563EB]/25 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-lg text-center">
          {/* Logo Mark */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl shadow-black/20">
              <MapPin className="w-9 h-9 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
            Land Investment
          </h1>
          <p className="text-lg text-blue-200 mb-8 font-light">
            Smart Land Investment & Rental Returns Platform
          </p>

          <div className="w-16 h-1 bg-[#2563EB] mx-auto mb-8 rounded-full" />

          <p className="text-blue-100/80 text-sm leading-relaxed max-w-md mx-auto">
            Track surveyed land parcels, monitor customer portfolios, manage
            automated daily rental yields, and generate audit-ready financial
            statements — all from an enterprise fintech cockpit.
          </p>

          {/* Key Metric Highlights */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center">
              <div className="text-2xl font-bold text-white tracking-tight">
                500+
              </div>
              <div className="text-xs text-blue-200/80 font-medium mt-1">
                Active Contracts
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center">
              <div className="text-2xl font-bold text-white tracking-tight">
                ₹2.5Cr+
              </div>
              <div className="text-xs text-blue-200/80 font-medium mt-1">
                Returns Paid
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center">
              <div className="text-2xl font-bold text-white tracking-tight">
                100%
              </div>
              <div className="text-xs text-blue-200/80 font-medium mt-1">
                Audited UTR
              </div>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs text-blue-100/90 border border-white/15">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bank-Grade Encryption & Audit-Verified Logs</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-8 sm:p-10">
            {/* Header / Brand on Mobile */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#142B4A] rounded-xl flex items-center justify-center shadow-md shadow-[#142B4A]/20">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#142B4A] tracking-tight">
                  Land Investment
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  Administrative Portal
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                Sign in to your account
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access the management dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2.5">
                <span className="shrink-0 font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Input using Reusable FormInput */}
              <FormInput
                label="Email Address"
                type="email"
                placeholder="admin@landvest.com"
                leftIcon={<Mail className="w-5 h-5" />}
                autoComplete="email"
                {...register("email")}
                error={errors.email?.message}
                required
              />

              {/* Password Input using Reusable FormInput */}
              <FormInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                autoComplete="current-password"
                {...register("password")}
                error={errors.password?.message}
                required
              />

              {/* Submit Button using Reusable Button */}
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={isSubmitting}
                className="w-full font-semibold shadow-md shadow-blue-500/20 mt-2"
              >
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            {/* Footer / Copyright */}
            <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
              <p>© 2025 LandVest Pro. All rights reserved.</p>
              <p className="text-[11px] text-slate-400/80">
                Authorized Personnel Only • IP Logged
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
