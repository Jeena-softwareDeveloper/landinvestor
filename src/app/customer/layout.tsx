'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  MapPin,
  LayoutDashboard,
  Building,
  TrendingUp,
  Wallet,
  User,
  LogOut,
  Bell,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/utils';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // If on login or signup, render plain layout
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const token = Cookies.get('customer_token');
        if (!token) {
          router.replace('/customer/login');
          return;
        }

        const res = await fetch('/api/auth/customer/me');
        if (!res.ok) {
          Cookies.remove('customer_token');
          router.replace('/customer/login');
          return;
        }

        const json = await res.json();
        if (json.success && json.customer) {
          setCustomer(json.customer);
          setLoading(false);
        } else {
          router.replace('/customer/login');
        }
      } catch {
        router.replace('/customer/login');
      }
    }

    checkAuth();
  }, [pathname, isAuthPage, router]);

  const handleLogout = () => {
    Cookies.remove('customer_token');
    router.replace('/customer/login');
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Strict Auth Wall: Never render dashboard or sensitive customer data if not logged in
  if (loading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Verifying customer credentials…</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Dashboard', shortLabel: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Available Lands', shortLabel: 'Lands', href: '/customer/lands', icon: Building },
    { label: 'Wallet & Payouts', shortLabel: 'Wallet', href: '/customer/withdrawals', icon: Wallet, isCenter: true },
    { label: 'My Investments', shortLabel: 'Investments', href: '/customer/investments', icon: TrendingUp },
    { label: 'My Profile', shortLabel: 'Profile', href: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-600 selection:text-white pb-24 md:pb-0">
      {/* ─── Top Desktop / Tablet Navigation Bar ─────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/customer/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#142B4A] to-[#2563EB] rounded-lg flex items-center justify-center text-white shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#142B4A] tracking-tight">
                Land<span className="text-[#2563EB]"> Investment</span>
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                INVESTOR
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/customer/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB] font-bold'
                      : 'hover:text-[#142B4A] hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {customer && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-bold">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Yield Wallet: {formatCurrency(customer.walletBalance || 0)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                href="/customer/profile"
                title="Investor Profile"
                className="w-8 h-8 rounded-full bg-[#142B4A] hover:bg-blue-600 text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                {customer?.fullName?.charAt(0) || 'C'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ─────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* ─── Mobile Bottom Navigation Bar (App Experience) ──────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around h-16 px-1 shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== '/customer/dashboard' && pathname.startsWith(link.href));

          if (link.isCenter) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center flex-1 py-1 relative"
              >
                <div
                  className={`w-14 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/40 -mt-3 ring-4 ring-white'
                      : 'bg-slate-100 text-slate-500 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-bold ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {link.shortLabel}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] transition-colors ${
                isActive ? 'text-[#2563EB] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
              <span className="truncate">{link.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

