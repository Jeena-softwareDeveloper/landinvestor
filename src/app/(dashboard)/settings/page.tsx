"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { User, Lock, Bell, Shield, Save, Award, Sparkles } from "lucide-react";
import { FormInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Investor Tier Levels & Rewards Control State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tiers, setTiers] = useState<any[]>([]);
  const [withdrawalNotice, setWithdrawalNotice] = useState("");
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [savingTiers, setSavingTiers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Fetch user info & tier configs
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;
        const [meRes, tierRes] = await Promise.all([
          fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/tiers", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user || data);
        }
        if (tierRes.ok) {
          const tierData = await tierRes.json();
          if (tierData.success) {
            setTiers(tierData.tiers || []);
            setWithdrawalNotice(tierData.defaultWithdrawalNotice || "");
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingUser(false);
        setLoadingTiers(false);
      }
    })();
  }, []);

  const handleUpdateTierField = (index: number, field: string, value: any) => {
    setTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const onSaveTiers = async () => {
    try {
      setSavingTiers(true);
      const token = Cookies.get("token");
      const res = await fetch("/api/admin/tiers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tiers,
          defaultWithdrawalNotice: withdrawalNotice,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to update tier configurations");
        return;
      }

      toast.success("Investor tiers, awards, and withdrawal rules saved successfully!");
    } catch {
      toast.error("Failed to save investor tier configuration");
    } finally {
      setSavingTiers(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      const token = Cookies.get("token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Settings & Preferences"
        description="Manage your admin account credentials, system profiles, and notifications."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <User className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-bold text-[#142B4A]">
            Profile Information
          </h2>
        </div>
        <div className="p-6">
          {loadingUser ? (
            <div className="flex items-center gap-2 py-4">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-slate-500">Loading profile details…</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                value={user?.name || "—"}
                readOnly
                disabled
              />
              <FormInput
                label="Email Address"
                value={user?.email || "—"}
                readOnly
                disabled
              />
              <FormInput
                label="Assigned System Role"
                value={user?.role?.toUpperCase() || "ADMIN"}
                readOnly
                disabled
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Investor Tier Levels & Rewards Control (Bronze -> Diamond) ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-[#142B4A]">
                Investor Tier Levels &amp; Rewards Control (Bronze &rarr; Diamond)
              </h2>
              <p className="text-xs text-slate-500">
                Configure minimum investment thresholds, daily bonus return boosts, withdrawal limits (% of investment), and award badges.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={savingTiers}
            onClick={onSaveTiers}
            className="font-bold gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Tier Configurations
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {loadingTiers ? (
            <div className="flex items-center gap-2 py-4">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-slate-500">Loading tier configurations…</span>
            </div>
          ) : (
            <>
              {/* Default Trustworthy Withdrawal Notice */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Important Withdrawal Policy Notice (Displayed to all Investors)
                </label>
                <textarea
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={withdrawalNotice}
                  onChange={(e) => setWithdrawalNotice(e.target.value)}
                />
              </div>

              {/* Tiers List */}
              <div className="space-y-4">
                {tiers.map((tier, idx) => (
                  <div
                    key={tier.key}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <h4 className="font-extrabold text-sm text-[#142B4A]">
                          {tier.name} ({tier.key.toUpperCase()})
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {tier.awardTitle}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Base Unlock: ₹{tier.minInvestment?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Min Investment (₹)
                        </label>
                        <input
                          type="number"
                          className="w-full text-xs p-2 rounded-md border border-slate-200"
                          value={tier.minInvestment}
                          onChange={(e) =>
                            handleUpdateTierField(idx, 'minInvestment', Number(e.target.value))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Daily Bonus Yield (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full text-xs p-2 rounded-md border border-slate-200"
                          value={tier.dailyBonusRate}
                          onChange={(e) =>
                            handleUpdateTierField(idx, 'dailyBonusRate', Number(e.target.value))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Withdrawal Limit (% of Inv)
                        </label>
                        <input
                          type="number"
                          className="w-full text-xs p-2 rounded-md border border-slate-200"
                          value={tier.withdrawalLimitPercentage}
                          onChange={(e) =>
                            handleUpdateTierField(
                              idx,
                              'withdrawalLimitPercentage',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Payout SLA (Hours)
                        </label>
                        <input
                          type="number"
                          className="w-full text-xs p-2 rounded-md border border-slate-200"
                          value={tier.payoutSlaHours}
                          onChange={(e) =>
                            handleUpdateTierField(idx, 'payoutSlaHours', Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Award Title / Medal Name
                        </label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 rounded-md border border-slate-200"
                          value={tier.awardTitle}
                          onChange={(e) =>
                            handleUpdateTierField(idx, 'awardTitle', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tier Rewards Description
                        </label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 rounded-md border border-slate-200"
                          value={tier.rewardsDescription}
                          onChange={(e) =>
                            handleUpdateTierField(idx, 'rewardsDescription', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  loading={savingTiers}
                  onClick={onSaveTiers}
                  className="font-bold gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Tier Configurations
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <Lock className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-bold text-[#142B4A]">
            Change Password
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmitPassword)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormInput
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                {...register("currentPassword")}
                error={errors.currentPassword?.message}
                required
              />
            </div>
            <div>
              <FormInput
                label="New Password"
                type="password"
                placeholder="Enter new password (min. 6 chars)"
                {...register("newPassword")}
                error={errors.newPassword?.message}
                required
              />
            </div>
            <div>
              <FormInput
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                required
              />
            </div>
          </div>
          <div>
            <Button
              type="submit"
              variant="secondary"
              loading={isSubmitting}
              className="gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <Bell className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-bold text-[#142B4A]">
            Notification Preferences
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                label: "Email Notifications",
                desc: "Receive email alerts for important platform activities and return disbursements",
              },
              {
                label: "Investment Activity Alerts",
                desc: "Get notified when new customer investments are created or allocated",
              },
              {
                label: "Withdrawal Requests Alerts",
                desc: "Immediate alerts when customers request yield or capital withdrawals",
              },
            ].map((pref) => (
              <div
                key={pref.label}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {pref.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                </div>
                <button
                  type="button"
                  aria-label={pref.label}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors cursor-pointer"
                >
                  <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white shadow transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-bold text-[#142B4A]">
            Security & Compliance
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            All administrative actions, transactions, and yield calculations are permanently audited.
            Role-based access enforcement and cryptographic password hashing (bcrypt) are active.
          </p>
        </div>
      </div>
    </div>
  );
}
