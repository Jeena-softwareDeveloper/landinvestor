'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  MapPin,
  Users,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/utils';
import { ILand, ICustomer } from '@/types';

const REPORT_TYPES = [
  { id: 'land_investment', name: 'Land Investment Report', icon: MapPin },
  { id: 'customer_investment', name: 'Customer Investment Portfolio', icon: Users },
  { id: 'daily_returns', name: 'Daily Returns Ledger', icon: TrendingUp },
  { id: 'transactions', name: 'Transactions & UTR Report', icon: FileSpreadsheet },
  { id: 'withdrawals', name: 'Customer Withdrawals Report', icon: FileBarChart },
  { id: 'liability', name: 'Outstanding Liability & Risk Report', icon: ShieldAlert },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState('land_investment');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [landId, setLandId] = useState('all');
  const [customerId, setCustomerId] = useState('all');

  const [lands, setLands] = useState<ILand[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [lRes, cRes] = await Promise.all([
          fetch('/api/lands?limit=100'),
          fetch('/api/customers?limit=100'),
        ]);
        const [lJson, cJson] = await Promise.all([lRes.json(), cRes.json()]);
        if (lJson.success) setLands(lJson.lands);
        if (cJson.success) setCustomers(cJson.customers);
      } catch {
        // quiet
      }
    }
    loadFilters();
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: selectedType,
        startDate,
        endDate,
        landId,
        customerId,
      });

      const res = await fetch(`/api/reports/export?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setReportData(json.data || []);
        setSummary(json.summary || {});
      } else {
        toast.error(json.message || 'Failed to generate report');
      }
    } catch {
      toast.error('Network error generating report');
    } finally {
      setLoading(false);
    }
  }, [selectedType, startDate, endDate, landId, customerId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('No data available to export');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      const filename = `${selectedType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success(`Exported ${reportData.length} records to ${filename}`);
    } catch {
      toast.error('Failed to export Excel file');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Get table column headers dynamically
  const tableHeaders = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Financial Analytics"
        description="Generate audited compliance records, return accrual ledgers, and exportable financial sheets."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPDF}
              className="bg-white"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print / Save as PDF
            </Button>
            <Button
              size="sm"
              onClick={handleExportExcel}
              className="bg-[#059669] hover:bg-[#047857]"
            >
              <Download className="w-4 h-4 mr-1.5" /> Export to Excel (.xlsx)
            </Button>
          </div>
        }
      />

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const isSelected = selectedType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setSelectedType(rt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                isSelected
                  ? 'bg-[#142B4A] text-white border-[#142B4A] shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-blue-600'}`}
              />
              <span className="text-xs font-semibold leading-tight">{rt.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          {/* Date Filters */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-slate-700"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-slate-700"
            />
          </div>

          {/* Land Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 uppercase text-[11px]">Land:</span>
            <select
              value={landId}
              onChange={(e) => setLandId(e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-slate-700"
            >
              <option value="all">All Lands</option>
              {lands.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 uppercase text-[11px]">Customer:</span>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-slate-700"
            >
              <option value="all">All Customers</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={fetchReport}>
          Apply Filter
        </Button>
      </div>

      {/* Summary Banner */}
      {Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          {Object.entries(summary).map(([key, val]: any) => (
            <div key={key}>
              <span className="text-slate-500 capitalize block text-[11px]">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="text-base font-bold text-slate-800">
                {typeof val === 'number' && val > 1000
                  ? formatCurrency(val)
                  : String(val)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#142B4A]">
              Report Preview ({reportData.length} Records)
            </h3>
            <p className="text-xs text-slate-500">Live preview of filtered dataset</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            {selectedType.replace('_', ' ')}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Generating dataset..." className="h-64" />
        ) : reportData.length > 0 ? (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  {tableHeaders.map((head) => (
                    <th key={head} className="py-3 px-4">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    {tableHeaders.map((col) => {
                      const val = row[col];
                      const isAmount =
                        typeof val === 'number' &&
                        (col.toLowerCase().includes('value') ||
                          col.toLowerCase().includes('amount') ||
                          col.toLowerCase().includes('return') ||
                          col.toLowerCase().includes('invested') ||
                          col.toLowerCase().includes('balance'));
                      return (
                        <td key={col} className="py-2.5 px-4 text-slate-700">
                          {isAmount ? formatCurrency(val) : String(val ?? '-')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No records match the current filter selection.
          </div>
        )}
      </div>
    </div>
  );
}
