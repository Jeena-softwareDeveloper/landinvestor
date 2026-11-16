'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  DollarSign,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { FormTextarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading';
import { SearchInput } from '@/components/ui/search-input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IPaymentOrder } from '@/types';

export default function AdminPaymentsVerificationPage() {
  const [orders, setOrders] = useState<IPaymentOrder[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Action Modals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject' | 'details' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
        status: statusFilter,
        search,
      });

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setOrders(json.orders);
        setStats(json.stats || {});
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load payment orders:', err);
      toast.error('Failed to load payment orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleVerify = async () => {
    if (!selectedOrder) return;
    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/payments/${selectedOrder.orderId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Verification failed');
        setProcessing(false);
        return;
      }

      toast.success(`Payment Order ${selectedOrder.orderId} verified & Investment activated!`);
      setSelectedOrder(null);
      setActionType(null);
      setAdminNotes('');
      fetchOrders();
    } catch {
      toast.error('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    if (!rejectionReason) {
      toast.error('Please specify a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/payments/${selectedOrder.orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason, adminNotes }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Rejection failed');
        setProcessing(false);
        return;
      }

      toast.success(`Payment Order ${selectedOrder.orderId} marked as rejected`);
      setSelectedOrder(null);
      setActionType(null);
      setRejectionReason('');
      setAdminNotes('');
      fetchOrders();
    } catch {
      toast.error('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Orders & UTR Verification"
        description="Reconcile customer UPI transfers, inspect 12-digit UTR references against bank statements, and activate investment contracts."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Payment Verification' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Awaiting Verification (Submitted)
          </span>
          <div className="text-2xl font-black text-amber-600">
            {stats.totalSubmitted || 0} Orders
          </div>
          <p className="text-[11px] text-slate-400">Customer submitted UTR awaiting review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Verified Payments
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(stats.totalVerified || 0)}
          </div>
          <p className="text-[11px] text-slate-400">{stats.verifiedCount || 0} contracts activated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Pending / In-Flight
          </span>
          <div className="text-2xl font-black text-[#142B4A]">
            {stats.pendingCount || 0}
          </div>
          <p className="text-[11px] text-slate-400">Initiated or processing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Duplicate UTR Protection
          </span>
          <div className="text-2xl font-black text-[#2563EB]">100% Active</div>
          <p className="text-[11px] text-emerald-600 font-bold">Immutable Audit Logs</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Search by Order ID, UTR, or Assigned UPI..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs h-9 px-3 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted (UTR Uploaded)</option>
            <option value="initiated">Initiated (Awaiting Payment)</option>
            <option value="verified">Verified (Completed)</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#142B4A]">Payment Verification Queue</h3>
          <span className="text-xs text-slate-400">{totalItems} Total Records</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <LoadingSpinner size="md" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No payment orders found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Target Land Parcel</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Assigned Merchant UPI</th>
                  <th className="py-3 px-4">UTR Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-[13px]">{ord.orderId}</div>
                      <div className="text-[11px] text-slate-400">{formatDate(ord.createdAt)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#142B4A]">{ord.customerId?.fullName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ord.customerId?.mobile}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ord.landId?.name}</div>
                      <div className="text-[10px] text-slate-400">Survey: {ord.landId?.surveyNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      {formatCurrency(ord.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-[11px]">{ord.assignedUpiName}</div>
                      <div className="font-mono text-[10px] text-[#2563EB]">{ord.assignedUpiString}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.utr ? (
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {ord.utr}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not Submitted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          ord.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'submitted'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {ord.status === 'submitted' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 px-2.5"
                            onClick={() => {
                              setSelectedOrder(ord);
                              setActionType('verify');
                            }}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 px-2.5"
                            onClick={() => {
                              setSelectedOrder(ord);
                              setActionType('reject');
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setActionType('details');
                        }}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Verify Confirmation Modal ──────────────────────────── */}
      {actionType === 'verify' && selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedOrder(null);
            setActionType(null);
          }}
          title={`Confirm Payment Verification: ${selectedOrder.orderId}`}
          description={`Customer: ${selectedOrder.customerId?.fullName} • Amount: ${formatCurrency(selectedOrder.amount)}`}
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Financial Activation Trigger</span>
              </div>
              <p>
                Verifying this payment order will immediately:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create an active <strong>Investment Contract</strong> for {selectedOrder.customerId?.fullName}.</li>
                <li>Deduct {formatCurrency(selectedOrder.amount)} from {selectedOrder.landId?.name}&apos;s available allocation.</li>
                <li>Write an immutable audit log linking UTR: <strong>{selectedOrder.utr}</strong>.</li>
              </ul>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Bank Reconciliation Reference:
              </label>
              <div className="font-mono font-bold text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[#142B4A]">
                {selectedOrder.utr}
              </div>
            </div>

            <FormTextarea
              label="Admin Audit Notes (Optional)"
              placeholder="e.g. Verified against ICICI Merchant Statement line #4928"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={processing}
                onClick={() => {
                  setSelectedOrder(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                loading={processing}
                onClick={handleVerify}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Confirm & Activate Contract
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Reject Modal ───────────────────────────────────────── */}
      {actionType === 'reject' && selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedOrder(null);
            setActionType(null);
          }}
          title={`Reject Payment Order: ${selectedOrder.orderId}`}
          description={`Customer: ${selectedOrder.customerId?.fullName}`}
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900">
              <strong>Warning:</strong> Rejecting will not allocate land units and will notify the customer.
            </div>

            <FormInput
              label="Rejection Reason *"
              placeholder="e.g. UTR mismatch on bank statement, payment not received"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />

            <FormTextarea
              label="Internal Admin Notes"
              placeholder="e.g. Checked with bank branch manager on 16-Nov"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={processing}
                onClick={() => {
                  setSelectedOrder(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                loading={processing}
                onClick={handleReject}
                className="font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Details Modal ──────────────────────────────────────── */}
      {actionType === 'details' && selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedOrder(null);
            setActionType(null);
          }}
          title={`Payment Order Details: ${selectedOrder.orderId}`}
          description={`Current Status: ${selectedOrder.status.toUpperCase()}`}
        >
          <div className="space-y-3 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer</span>
                <strong>{selectedOrder.customerId?.fullName}</strong>
                <div className="text-slate-500">{selectedOrder.customerId?.mobile}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Land Parcel</span>
                <strong>{selectedOrder.landId?.name}</strong>
                <div className="text-slate-500">{selectedOrder.landId?.surveyNumber}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Order Amount</span>
                <strong className="text-sm text-slate-900">{formatCurrency(selectedOrder.amount)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Destination</span>
                <strong>{selectedOrder.assignedUpiName}</strong>
                <div className="font-mono text-[#2563EB]">{selectedOrder.assignedUpiString}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Submitted UTR</span>
                <strong className="font-mono text-sm text-slate-900">{selectedOrder.utr || 'None'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Creation Date</span>
                <span>{formatDate(selectedOrder.createdAt)}</span>
              </div>
            </div>

            {selectedOrder.customerNotes && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Customer Notes</span>
                <p className="text-slate-700 mt-0.5">{selectedOrder.customerNotes}</p>
              </div>
            )}

            {selectedOrder.adminNotes && (
              <div className="p-3 bg-slate-100 rounded-lg">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Admin Audit Notes</span>
                <p className="text-slate-700 mt-0.5">{selectedOrder.adminNotes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedOrder(null);
                  setActionType(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

