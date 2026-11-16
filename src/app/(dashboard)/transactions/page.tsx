'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, CheckCircle, XCircle, Search, Filter, ShieldCheck, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ITransaction } from '@/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Verification modal state
  const [selectedTx, setSelectedTx] = useState<ITransaction | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        type,
        status,
      });

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setTransactions(json.transactions);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, type, status]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleUpdateStatus = async (newStatus: 'verified' | 'completed' | 'rejected') => {
    if (!selectedTx) return;
    try {
      setVerifying(true);
      const res = await fetch(`/api/transactions/${selectedTx._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes || selectedTx.adminNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Transaction marked as ${newStatus}!`);
        setSelectedTx(null);
        setAdminNotes('');
        fetchTransactions();
      } else {
        toast.error(json.message || 'Failed to update transaction');
      }
    } catch {
      toast.error('Network error during transaction verification');
    } finally {
      setVerifying(false);
    }
  };

  const columns: Column<ITransaction>[] = [
    {
      key: 'transactionDate',
      header: 'Date',
      render: (row) => <span className="text-slate-600">{formatDate(row.transactionDate)}</span>,
    },
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
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className="font-semibold text-xs uppercase tracking-wide text-slate-800">
          {row.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => {
        const isCredit = row.type === 'deposit';
        return (
          <span
            className={`font-bold ${
              isCredit ? 'text-emerald-700' : 'text-slate-900'
            }`}
          >
            {formatCurrency(row.amount)}
          </span>
        );
      },
    },
    {
      key: 'upiReference',
      header: 'Reference / UTR',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-medium text-slate-800">{row.upiReference}</span>
          <span className="text-[11px] text-slate-400 capitalize">{row.paymentMethod}</span>
        </div>
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
      header: 'Verification',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'pending' ? (
            <Button
              size="sm"
              variant="default"
              className="h-8 text-xs bg-[#2563EB] hover:bg-[#1d4ed8]"
              onClick={() => {
                setSelectedTx(row);
                setAdminNotes(row.adminNotes || '');
              }}
            >
              Verify / Review
            </Button>
          ) : (
            <span className="text-xs text-slate-400 font-medium px-2 py-1">Audited</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="UPI & Money Transfer Management"
        description="Audit and manually record customer deposits, rental returns, and ledger settlements with anti-duplicate validation."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Transactions' }]}
        actions={
          <Link href="/transactions/new">
            <Button className="bg-[#142B4A] hover:bg-[#1a3a62]">
              <Plus className="w-4 h-4 mr-1.5" /> Record Manual Entry
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchInput
          placeholder="Search by UTR reference, customer notes, UPI ID..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80"
        />

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Type:</span>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="return_payment">Return Payment</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="refund">Refund</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setCurrentPage}
        emptyTitle="No transactions found"
        emptyDescription="Manual transactions or verified settlements will appear here."
      />

      {/* Verification / Action Modal */}
      {selectedTx && (
        <Modal
          open={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          title="Verify Money Transfer Entry"
          description="Confirm bank statement match before approving or marking transaction as verified."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">
                  {(selectedTx.customerId as any)?.fullName || 'Investor'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Type:</span>
                <span className="font-bold uppercase text-slate-800">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transfer Amount:</span>
                <span className="text-base font-bold text-emerald-700">
                  {formatCurrency(selectedTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR / Reference:</span>
                <span className="font-mono font-bold text-blue-600">
                  {selectedTx.upiReference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Date:</span>
                <span className="text-slate-700">{formatDate(selectedTx.transactionDate)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Verification & Audit Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Record bank statement reference, reconciliation timestamp, or mismatch details..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="destructive"
                size="sm"
                loading={verifying}
                onClick={() => handleUpdateStatus('rejected')}
              >
                Reject Entry
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-[#059669] hover:bg-[#047857]"
                loading={verifying}
                onClick={() => handleUpdateStatus('completed')}
              >
                Approve & Mark Completed
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

