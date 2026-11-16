'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ILand } from '@/types';

export default function LandsPage() {
  const router = useRouter();
  const [lands, setLands] = useState<ILand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ILand | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLands = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        status,
      });

      const res = await fetch(`/api/lands?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setLands(json.lands);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load lands');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/lands/${deleteTarget._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Land property deleted successfully');
        setDeleteTarget(null);
        fetchLands();
      } else {
        toast.error(json.message || 'Failed to delete land');
      }
    } catch {
      toast.error('Network error deleting land');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<ILand>[] = [
    {
      key: 'name',
      header: 'Land Property',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.name}</span>
          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" /> {row.location}
          </span>
        </div>
      ),
    },
    {
      key: 'surveyNumber',
      header: 'Survey No',
      render: (row) => (
        <span className="font-mono text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">
          {row.surveyNumber}
        </span>
      ),
    },
    {
      key: 'totalArea',
      header: 'Area (sq ft)',
      align: 'right',
      render: (row) => <span>{formatNumber(row.totalArea)} sq ft</span>,
    },
    {
      key: 'totalValue',
      header: 'Valuation',
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-slate-900">{formatCurrency(row.totalValue)}</span>
      ),
    },
    {
      key: 'totalInvested',
      header: 'Invested',
      align: 'right',
      render: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-medium text-emerald-700">{formatCurrency(row.totalInvested)}</span>
          <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#2563EB] h-full rounded-full"
              style={{ width: `${Math.min(row.investmentPercentage || 0, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {(row.investmentPercentage || 0).toFixed(1)}% funded
          </span>
        </div>
      ),
    },
    {
      key: 'availableInvestment',
      header: 'Available',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-slate-700">
          {formatCurrency(row.availableInvestment)}
        </span>
      ),
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
          <Link href={`/lands/${row._id}`}>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View details">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href={`/lands/${row._id}/edit`}>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit property">
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            title="Delete land"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Land Management"
        description="Monitor, acquire, and manage land parcels, investment capacities, and leasing parameters."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Lands' }]}
        actions={
          <Link href="/lands/new">
            <Button className="bg-[#142B4A] hover:bg-[#1a3a62]">
              <Plus className="w-4 h-4 mr-1.5" /> Add New Land
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchInput
          placeholder="Search by land name, location, survey no..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="fully_funded">Fully Funded</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={lands}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setCurrentPage}
        onRowClick={(row) => router.push(`/lands/${row._id}`)}
        emptyTitle="No land properties found"
        emptyDescription="Start by adding your first land parcel or adjust your search filter."
      />

      {/* Safety Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Land Property"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Deletion is restricted if active customer investments exist.`}
        confirmText="Confirm Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
