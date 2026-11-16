'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, XCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IInvestment } from '@/types';

export default function InvestmentsPage() {
  const router = useRouter();
  const [investments, setInvestments] = useState<IInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Cancel investment modal state
  const [cancelTarget, setCancelTarget] = useState<IInvestment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status,
      });

      const res = await fetch(`/api/investments?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setInvestments(json.investments);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, status]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      const res = await fetch(`/api/investments/${cancelTarget._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Investment cancelled and land capacity restored!');
        setCancelTarget(null);
        fetchInvestments();
      } else {
        toast.error(json.message || 'Failed to cancel investment');
      }
    } catch {
      toast.error('Network error during investment cancellation');
    } finally {
      setCancelling(false);
    }
  };

  const columns: Column<IInvestment>[] = [
    {
      key: 'customerId',
      header: 'Customer',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">
            {row.customerId?.fullName || 'Customer'}
          </span>
          <span className="font-mono text-xs text-slate-500">
            {row.customerId?.customerId || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'landId',
      header: 'Land Asset',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{row.landId?.name || 'Property'}</span>
          <span className="font-mono text-[11px] text-slate-400">
            Survey: {row.landId?.surveyNumber || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Invested Amount',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'returnRate',
      header: 'Return Rate',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-medium text-blue-700">{row.returnRate}%/day</span>
      ),
    },
    {
      key: 'dailyAccruedReturn',
      header: 'Daily Yield',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-emerald-700">
          {formatCurrency(row.dailyAccruedReturn || 0)}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Tenure',
      align: 'center',
      render: (row) => <span className="text-slate-600 font-medium">{row.duration} Mos</span>,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => <span className="text-slate-600">{formatDate(row.startDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/investments/${row._id}`}>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Details">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {row.status === 'active' && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0"
              title="Cancel Investment & Restore Land Quota"
              onClick={() => setCancelTarget(row)}
            >
              <XCircle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investment Management"
        description="Allocate customer capital to surveyed land holdings, monitor accrual parameters, and manage tenures."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Investments' }]}
        actions={
          <Link href="/investments/new">
            <Button className="bg-[#142B4A] hover:bg-[#1a3a62]">
              <Plus className="w-4 h-4 mr-1.5" /> Create Investment
            </Button>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-600">
            All return figures reflect configurable business rules and rental distributions.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="matured">Matured</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Investments Data Table */}
      <DataTable
        columns={columns}
        data={investments}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setCurrentPage}
        onRowClick={(row) => router.push(`/investments/${row._id}`)}
        emptyTitle="No investments recorded"
        emptyDescription="Create an investment allocation for a customer."
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel Investment Allocation"
        message={`Are you sure you want to cancel this ₹${cancelTarget?.amount.toLocaleString(
          'en-IN'
        )} investment? The invested capital capacity will immediately be restored to the land asset.`}
        confirmText="Confirm Cancellation"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
