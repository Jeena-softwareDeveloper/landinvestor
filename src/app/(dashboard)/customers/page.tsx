'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ICustomer } from '@/types';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycStatus, setKycStatus] = useState('all');
  const [accountStatus, setAccountStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Deactivate modal state
  const [targetCustomer, setTargetCustomer] = useState<ICustomer | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        kycStatus,
        accountStatus,
      });

      const res = await fetch(`/api/customers?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setCustomers(json.customers);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, kycStatus, accountStatus]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDeactivate = async () => {
    if (!targetCustomer) return;
    try {
      setDeactivating(true);
      const res = await fetch(`/api/customers/${targetCustomer._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Customer status updated to inactive');
        setTargetCustomer(null);
        fetchCustomers();
      } else {
        toast.error(json.message || 'Failed to deactivate customer');
      }
    } catch {
      toast.error('Network error during customer deactivation');
    } finally {
      setDeactivating(false);
    }
  };

  const columns: Column<ICustomer>[] = [
    {
      key: 'customerId',
      header: 'Customer ID',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#2563EB] px-2 py-0.5 bg-blue-50 rounded">
          {row.customerId}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Customer Name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.fullName}</span>
          <span className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5">
              <Mail className="w-3 h-3 text-slate-400" /> {row.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Phone className="w-3 h-3 text-slate-400" /> {row.mobile}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.kycStatus} />,
    },
    {
      key: 'totalInvestment',
      header: 'Total Invested',
      align: 'right',
      render: (row: any) => (
        <span className="font-semibold text-emerald-700">
          {formatCurrency(row.totalInvestment || 0)}
        </span>
      ),
    },
    {
      key: 'upiId',
      header: 'UPI / Bank',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 truncate max-w-[140px] block">
          {row.upiId || row.bankDetails?.bankName || '-'}
        </span>
      ),
    },
    {
      key: 'accountStatus',
      header: 'Account',
      align: 'center',
      render: (row) => <StatusBadge status={row.accountStatus} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/customers/${row._id}`}>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Portfolio">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href={`/customers/${row._id}/edit`}>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Customer">
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            title="Deactivate Customer"
            onClick={() => setTargetCustomer(row)}
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
        title="Customer Management"
        description="Verify investor KYC profiles, monitor individual land holdings, and review bank details."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers' }]}
        actions={
          <Link href="/customers/new">
            <Button className="bg-[#142B4A] hover:bg-[#1a3a62]">
              <UserPlus className="w-4 h-4 mr-1.5" /> Add Customer
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchInput
          placeholder="Search by name, ID, email, mobile..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80"
        />

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">KYC:</span>
            <select
              value={kycStatus}
              onChange={(e) => {
                setKycStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
            <select
              value={accountStatus}
              onChange={(e) => {
                setAccountStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setCurrentPage}
        onRowClick={(row) => router.push(`/customers/${row._id}`)}
        emptyTitle="No customer profiles found"
        emptyDescription="Create your first investor profile or clear search criteria."
      />

      <ConfirmDialog
        open={Boolean(targetCustomer)}
        title="Deactivate Customer Account"
        message={`Are you sure you want to set "${targetCustomer?.fullName}" (${targetCustomer?.customerId}) to inactive? This cannot be completed if they hold active investments.`}
        confirmText="Deactivate"
        variant="warning"
        loading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setTargetCustomer(null)}
      />
    </div>
  );
}

