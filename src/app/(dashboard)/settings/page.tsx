"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { User, Lock, Bell, Shield, Loader2, Save } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Fetch user info
  useEffect(() => {
    (async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        }
      } catch {
        // ignore
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <User className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-semibold text-[#1E293B]">
            Profile Information
          </h2>
        </div>
        <div className="p-6">
          {loadingUser ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading profile…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.name || "—"}
                  readOnly
                  className="block w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-[#1E293B] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || "—"}
                  readOnly
                  className="block w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-[#1E293B] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role || "—"}
                  readOnly
                  className="block w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-[#1E293B] capitalize cursor-not-allowed"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <Lock className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-semibold text-[#1E293B]">
            Change Password
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmitPassword)} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                {...register("currentPassword")}
                className={`block w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                  errors.currentPassword
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="Enter current password"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                {...register("newPassword")}
                className={`block w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                  errors.newPassword
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className={`block w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                  errors.confirmPassword
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-[#2563EB]/70 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <Bell className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-semibold text-[#1E293B]">
            Notifications
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                label: "Email Notifications",
                desc: "Receive email alerts for important updates",
              },
              {
                label: "Investment Alerts",
                desc: "Get notified about new investment activities",
              },
              {
                label: "Withdrawal Alerts",
                desc: "Get notified about withdrawal requests",
              },
            ].map((pref) => (
              <div
                key={pref.label}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">
                    {pref.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                  <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          <h2 className="text-base font-semibold text-[#1E293B]">
            Security Preferences
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500">
            Two-factor authentication and advanced security settings will be
            available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
