'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  TrendingUp,
  Users,
  Building2,
  Calculator,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/ui/stat-card';
import { DashboardChart } from '@/components/dashboard/dashboard-chart';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/auth/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success('Database seeded with demo enterprise data!');
        fetchDashboardData();
      } else {
        toast.error(json.error || 'Seeding failed');
      }
    } catch {
      toast.error('Failed to run database seeder');
    } finally {
      setSeeding(false);
    }
  };

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const activities = data?.activities || {};

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-[#142B4A] via-[#1a3a62] to-[#2563EB] p-6 rounded-2xl text-white shadow-md">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Land Investment & Rental Returns
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Executive Financial Dashboard</h1>
          <p className="text-sm text-slate-200 mt-1">
            Real-time tracking of land portfolios, customer allocations, daily rental income & withdrawals.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleSeedData}
            loading={seeding}
            className="bg-white text-[#142B4A] hover:bg-slate-100 font-semibold"
          >
            Seed Demo Data
          </Button>
        </div>
      </div>

      {/* Top Statistics Cards (Grid: 4 columns on large screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Land Value"
          value={formatCurrency(stats.totalLandValue || 0)}
          icon={MapPin}
          color="blue"
          description="Total assessed valuation across properties"
        />
        <StatCard
          title="Customer Investments"
          value={formatCurrency(stats.totalCustomerInvestments || 0)}
          icon={TrendingUp}
          color="green"
          description="Active customer capital deployed"
        />
        <StatCard
          title="Active Customers"
          value={stats.totalActiveCustomers || 0}
          icon={Users}
          color="purple"
          description="Verified investors on platform"
        />
        <StatCard
          title="Active Lands"
          value={stats.totalActiveLands || 0}
          icon={Building2}
          color="indigo"
          description="Properties accepting investments"
        />

        <StatCard
          title="Today's Accrued Returns"
          value={formatCurrency(stats.todayAccruedReturns || 0)}
          icon={Calculator}
          color="amber"
          description="Accrued from active land rental leases"
        />
        <StatCard
          title="Total Returns Paid"
          value={formatCurrency(stats.totalReturnsPaid || 0)}
          icon={CheckCircle}
          color="emerald"
          description="Cumulative rental yield paid out"
        />
        <StatCard
          title="Pending Withdrawals"
          value={formatCurrency(stats.pendingWithdrawals || 0)}
          icon={Clock}
          color="rose"
          description="Awaiting admin approval & payout"
        />
        <StatCard
          title="Available Capacity"
          value={formatCurrency(stats.availableInvestmentCapacity || 0)}
          icon={Target}
          color="cyan"
          description="Remaining investment capacity"
        />
      </div>

      {/* Financial Analytics Charts (2x2 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Investment Growth Trend"
          subtitle="Cumulative customer investments growth over 12 months"
          type="area"
          data={charts.investmentGrowth || []}
          dataKey="value"
          categoryKey="name"
          dataName="Cumulative Portfolio (₹)"
        />

        <DashboardChart
          title="Monthly Returns Payouts"
          subtitle="Monthly rental income distributed to customers"
          type="bar"
          data={charts.monthlyReturns || []}
          dataKey="value"
          categoryKey="name"
          dataName="Distributed Yield (₹)"
        />

        <DashboardChart
          title="Land-wise Investment Distribution"
          subtitle="Capital allocation breakdown across properties"
          type="pie"
          data={charts.landDistribution || []}
          dataKey="value"
          categoryKey="name"
        />

        <DashboardChart
          title="Top Customer Portfolios"
          subtitle="Highest capital contributions by customer"
          type="bar"
          data={charts.customerDistribution || []}
          dataKey="value"
          categoryKey="name"
          dataName="Investment Amount (₹)"
        />
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Investments Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#142B4A]">Recent Investments</h3>
              <p className="text-xs text-slate-500">Newly recorded customer land allocations</p>
            </div>
            <Link
              href="/investments"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Land</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activities.recentInvestments?.length > 0 ? (
                  activities.recentInvestments.map((inv: any) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-800">
                        {inv.customerId?.fullName || 'Investor'}
                      </td>
                      <td className="py-3 text-slate-600">{inv.landId?.name || 'Land Property'}</td>
                      <td className="py-3 font-semibold text-slate-900">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      No recent investments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Withdrawals Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#142B4A]">Pending Withdrawals</h3>
              <p className="text-xs text-slate-500">Customer requests requiring verification</p>
            </div>
            <Link
              href="/withdrawals"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Requested</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activities.pendingWithdrawals?.length > 0 ? (
                  activities.pendingWithdrawals.map((wd: any) => (
                    <tr key={wd._id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-800">
                        {wd.customerId?.fullName || 'Customer'}
                      </td>
                      <td className="py-3 font-semibold text-rose-600">
                        {formatCurrency(wd.requestedAmount)}
                      </td>
                      <td className="py-3 text-slate-500">{formatDate(wd.requestDate)}</td>
                      <td className="py-3">
                        <Link href="/withdrawals">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      No pending withdrawal requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

