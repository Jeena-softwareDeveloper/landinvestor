'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  CreditCard,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IWithdrawal } from '@/types';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<IWithdrawal[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Action Modal State
  const [activeWithdrawal, setActiveWithdrawal] = useState<IWithdrawal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'process' | 'pay' | 'reject' | null>(
    null
  );
  const [paymentReference, setPaymentReference] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter,
      });

      const res = await fetch(`/api/withdrawals?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setWithdrawals(json.withdrawals);
        setStats(json.stats || {});
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleExecuteAction = async () => {
    if (!activeWithdrawal || !actionType) return;
    try {
      setProcessing(true);

      let targetStatus = 'pending';
      if (actionType === 'approve') targetStatus = 'approved';
      if (actionType === 'process') targetStatus = 'processing';
      if (actionType === 'pay') targetStatus = 'paid';
      if (actionType === 'reject') targetStatus = 'rejected';

      const payload: any = {
        status: targetStatus,
      };

      if (actionType === 'pay') {
        if (!paymentReference) {
          toast.error('Payment Reference (UTR/Cheque No) is required');
          setProcessing(false);
          return;
        }
        payload.paymentReference = paymentReference;
      }

      if (actionType === 'reject') {
        if (!rejectionReason) {
          toast.error('Please specify a rejection reason');
          setProcessing(false);
          return;
        }
        payload.rejectionReason = rejectionReason;
      }

      const res = await fetch(`/api/withdrawals/${activeWithdrawal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Withdrawal status updated to ${targetStatus}!`);
        setActiveWithdrawal(null);
        setActionType(null);
        setPaymentReference('');
        setRejectionReason('');
        fetchWithdrawals();
      } else {
        toast.error(json.message || 'Action failed');
      }
    } catch {
      toast.error('Network error executing withdrawal action');
    } finally {
      setProcessing(false);
    }
  };

  const columns: Column<IWithdrawal>[] = [
    {
      key: 'requestDate',
      header: 'Requested On',
      render: (row) => <span className="text-slate-600">{formatDate(row.requestDate)}</span>,
    },
    {
      key: 'customerId',
      header: 'Customer Details',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">
            {row.customerId?.fullName || 'Investor'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {row.customerId?.customerId || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'requestedAmount',
      header: 'Amount Requested',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-rose-600">{formatCurrency(row.requestedAmount)}</span>
      ),
    },
    {
      key: 'availableBalance',
      header: 'Available Balance',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-slate-700">{formatCurrency(row.availableBalance)}</span>
      ),
    },
    {
      key: 'settlement',
      header: 'Payout Destination',
      render: (row: any) => {
        const upi = row.upiId || row.customerId?.upiId;
        const bank = row.bankDetails?.bankName || row.customerId?.bankDetails?.bankName;
        const acct = row.bankDetails?.accountNumber || row.customerId?.bankDetails?.accountNumber;
        return (
          <div className="flex flex-col text-xs">
            {upi ? (
              <span className="font-mono font-medium text-blue-600">UPI: {upi}</span>
            ) : bank ? (
              <span className="text-slate-700">
                {bank} •••• {acct?.slice(-4)}
              </span>
            ) : (
              <span className="text-slate-400">No account on file</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Admin Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setActiveWithdrawal(row);
                  setActionType('approve');
                }}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={() => {
                  setActiveWithdrawal(row);
                  setActionType('reject');
                }}
              >
                Reject
              </Button>
            </>
          )}

          {row.status === 'approved' && (
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setActiveWithdrawal(row);
                setActionType('pay');
              }}
            >
              Record Payout
            </Button>
          )}

          {row.status === 'paid' && (
            <span className="font-mono text-[11px] text-slate-500">
              UTR: {row.paymentReference || 'Completed'}
            </span>
          )}

          {row.status === 'rejected' && (
            <span className="text-xs text-rose-500 italic">Rejected</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawal Management"
        description="Verify and authorize investor return payout requests against available wallet balances."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Withdrawals' }]}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Approval Requests
          </span>
          <h3 className="text-2xl font-bold text-amber-600">
            {stats.pendingCount || 0} Requests
          </h3>
          <p className="text-xs text-slate-400">Awaiting admin review</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pending Outflow
          </span>
          <h3 className="text-2xl font-bold text-rose-600">
            {formatCurrency(stats.totalPendingAmount || 0)}
          </h3>
          <p className="text-xs text-slate-400">Current liquidity requirement</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Disbursed Withdrawals
          </span>
          <h3 className="text-2xl font-bold text-emerald-600">
            {formatCurrency(stats.totalPaidAmount || 0)}
          </h3>
          <p className="text-xs text-slate-400">Cumulative settlements paid</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="all">All Withdrawals</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved (Ready for Payout)</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid & Settled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <DataTable
        columns={columns}
        data={withdrawals}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setCurrentPage}
        emptyTitle="No withdrawal requests found"
        emptyDescription="Customer withdrawal requests will be displayed here for authorization."
      />

      {/* Action Dialog */}
      {activeWithdrawal && actionType && (
        <Modal
          open={Boolean(activeWithdrawal)}
          onClose={() => {
            setActiveWithdrawal(null);
            setActionType(null);
          }}
          title={
            actionType === 'approve'
              ? 'Approve Customer Withdrawal'
              : actionType === 'pay'
              ? 'Execute Withdrawal Payout'
              : 'Reject Withdrawal Request'
          }
          description={`Customer: ${(activeWithdrawal.customerId as any)?.fullName} • Amount: ${formatCurrency(
            activeWithdrawal.requestedAmount
          )}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Amount:</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(activeWithdrawal.requestedAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Available Balance:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(activeWithdrawal.availableBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Target:</span>
                <span className="font-mono text-slate-800">
                  {activeWithdrawal.upiId || 'Direct Bank NEFT/RTGS'}
                </span>
              </div>
            </div>

            {actionType === 'pay' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Bank Reference Number (UTR / Transaction ID) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR401568912301"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            )}

            {actionType === 'reject' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Reason for Rejection *
                </label>
                <textarea
                  placeholder="e.g. Bank details mismatch, insufficient verified yield accrual..."
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={processing}
                onClick={() => {
                  setActiveWithdrawal(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionType === 'reject' ? 'destructive' : 'default'}
                loading={processing}
                onClick={handleExecuteAction}
                className={
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'pay'
                    ? 'bg-[#2563EB] hover:bg-[#1d4ed8]'
                    : ''
                }
              >
                {actionType === 'approve'
                  ? 'Confirm Approval'
                  : actionType === 'pay'
                  ? 'Confirm Payout Disbursed'
                  : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
