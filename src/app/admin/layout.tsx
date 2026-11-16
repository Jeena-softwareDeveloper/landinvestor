'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import { LoadingSpinner } from '@/components/ui/loading';

interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  const verifyAuth = useCallback(async () => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        Cookies.remove('token');
        router.replace('/admin/login');
        return;
      }

      const data = await res.json();
      setUser(data.user || data);
    } catch {
      Cookies.remove('token');
      router.replace('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router, isLoginPage]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Verifying Administrator Session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

