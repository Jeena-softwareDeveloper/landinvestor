'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Play,
  CheckSquare,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormInput } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IDailyReturn, ILand } from '@/types';

export default function DailyReturnsPage() {
  const [returns, setReturns] = useState<IDailyReturn[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>({});
  const [lands, setLands] = useState<ILand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [landFilter, setLandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Calculation Modal
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcDate, setCalcDate] = useState(new Date().toISOString().split('T')[0]);
  const [calcLandId, setCalcLandId] = useState('all');
  const [calcOverrideRate, setCalcOverrideRate] = useState<string>('');
  const [calculating, setCalculating] = useState(false);

  // Batch Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updatingBatch, setUpdatingBatch] = useState(false);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
        landId: landFilter,
        status: statusFilter,
        startDate,
        endDate,
      });

      const res = await fetch(`/api/returns?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setReturns(json.returns);
        setSummary(json.summary || {});
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load daily return records');
    } finally {
      setLoading(false);
    }
  }, [currentPage, landFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    async function loadLands() {
      try {
        const res = await fetch('/api/lands?limit=100');
        const json = await res.json();
        if (json.success) setLands(json.lands);
      } catch {
        // quiet
      }
    }
    loadLands();
  }, []);

  const handleRunCalculation = async () => {
    try {
      setCalculating(true);
      const payload: any = {
        date: calcDate,
        landId: calcLandId !== 'all' ? calcLandId : undefined,
      };
      if (calcOverrideRate) {
        payload.overrideRate = parseFloat(calcOverrideRate);
      }

      const res = await fetch('/api/returns/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowCalcModal(false);
        fetchReturns();
      } else {
        toast.error(json.message || 'Calculation failed');
      }
    } catch {
      toast.error('Network error during calculation');
    } finally {
      setCalculating(false);
    }
  };

  const handleBatchUpdate = async (newStatus: 'verified' | 'paid') => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one return entry');
      return;
    }

    try {
      setUpdatingBatch(true);
      const res = await fetch('/api/returns/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnIds: selectedIds,
          status: newStatus,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setSelectedIds([]);
        fetchReturns();
      } else {
        toast.error(json.message || 'Failed to update return status');
      }
    } catch {
      toast.error('Network error during batch update');
    } finally {
      setUpdatingBatch(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === returns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(returns.map((r) => r._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const columns: Column<IDailyReturn>[] = [
    {
      key: 'select',
      header: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row._id)}
          onChange={() => toggleSelectOne(row._id)}
          className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
        />
      ),
    },
    {
      key: 'date',
      header: 'Return Date',
      render: (row) => <span className="text-slate-700 font-medium">{formatDate(row.date)}</span>,
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">
            {row.customerId?.fullName || 'Customer'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {row.customerId?.customerId || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'landId',
      header: 'Land Asset',
      render: (row: any) => (
        <span className="font-medium text-slate-800">{row.landId?.name || 'Property'}</span>
      ),
    },
    {
      key: 'investmentAmount',
      header: 'Principal',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-slate-700">{formatCurrency(row.investmentAmount)}</span>
      ),
    },
    {
      key: 'dailyReturnAmount',
      header: 'Daily Yield',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-emerald-700">{formatCurrency(row.dailyReturnAmount)}</span>
      ),
    },
    {
      key: 'returnRate',
      header: 'Rate',
      align: 'right',
      render: (row) => <span className="font-mono text-xs text-blue-700">{row.returnRate}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Returns Management"
        description="Calculate daily rental distributions from land lease receipts, verify calculations, and execute payouts."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Daily Returns' }]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCalcModal(true)}
              className="bg-[#142B4A] hover:bg-[#1a3a62]"
            >
              <Calculator className="w-4 h-4 mr-1.5" /> Run Return Calculation
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Accrued Yield
          </span>
          <h3 className="text-2xl font-bold text-[#142B4A]">
            {formatCurrency(summary.totalAccrued || 0)}
          </h3>
          <p className="text-xs text-slate-400">Total calculated returns across all dates</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Yield Paid Out
          </span>
          <h3 className="text-2xl font-bold text-emerald-600">
            {formatCurrency(summary.totalPaid || 0)}
          </h3>
          <p className="text-xs text-slate-400">Settled and credited to customer accounts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Payout / Verification
          </span>
          <h3 className="text-2xl font-bold text-amber-600">
            {formatCurrency(summary.totalPending || 0)}
          </h3>
          <p className="text-xs text-slate-400">Accrued liability awaiting settlement</p>
        </div>
      </div>

      {/* Filter and Batch Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Land:</span>
            <select
              value={landFilter}
              onChange={(e) => {
                setLandFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Lands</option>
              {lands.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Statuses</option>
              <option value="accrued">Accrued (Unverified)</option>
              <option value="verified">Verified (Approved)</option>
              <option value="paid">Paid (Disbursed)</option>
            </select>
          </div>
        </div>

        {/* Batch Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="text-xs font-semibold text-blue-900">
              {selectedIds.length} Selected:
            </span>
            <Button
              size="sm"
              variant="outline"
              loading={updatingBatch}
              onClick={() => handleBatchUpdate('verified')}
              className="h-7 text-xs bg-white"
            >
              Mark Verified
            </Button>
            <Button
              size="sm"
              loading={updatingBatch}
              onClick={() => handleBatchUpdate('paid')}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Disburse Payout
            </Button>
          </div>
        )}
      </div>

      {/* Daily Returns Data Table */}
      <DataTable
        columns={columns}
        data={returns}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={15}
        onPageChange={setCurrentPage}
        emptyTitle="No daily returns recorded"
        emptyDescription="Run a daily return calculation above to accrue returns for active investments."
      />

      {/* Calculation Modal */}
      {showCalcModal && (
        <Modal
          open={showCalcModal}
          onClose={() => setShowCalcModal(false)}
          title="Execute Daily Return Calculation"
          description="Accrues daily yields for active customer investments according to configured rates."
        >
          <div className="space-y-4">
            <FormInput
              label="Calculation Date"
              type="date"
              value={calcDate}
              onChange={(e) => setCalcDate(e.target.value)}
              required
            />

            <FormSelect
              label="Filter by Land Parcel"
              value={calcLandId}
              onChange={(e) => setCalcLandId(e.target.value)}
              options={[
                { value: 'all', label: 'All Active Land Properties' },
                ...lands.map((l) => ({ value: l._id, label: l.name })),
              ]}
            />

            <FormInput
              label="Rate Override (%) (Optional)"
              type="number"
              step="0.01"
              placeholder="Leave blank to use each contract's configured rate"
              value={calcOverrideRate}
              onChange={(e) => setCalcOverrideRate(e.target.value)}
              helperText="E.g. enter 0.12 for 0.12% daily return override"
            />

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Financial Safety Note:</span>
              </div>
              <p>
                Calculations set returns to <strong>Accrued</strong> status. They will not be
                credited or marked as paid until you verify or execute payout disbursement. Duplicate
                entries for the same investment and date are automatically skipped.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={calculating}
                onClick={() => setShowCalcModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                loading={calculating}
                onClick={handleRunCalculation}
                className="bg-[#142B4A] hover:bg-[#1a3a62]"
              >
                Start Calculation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

