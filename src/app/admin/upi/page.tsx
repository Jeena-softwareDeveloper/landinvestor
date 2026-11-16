'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Settings,
  AlertTriangle,
  FileText,
  Trash2,
  Edit,
  Power,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IUpiAccount, UpiRotationStrategy } from '@/types';

export default function AdminUpiManagementPage() {
  const [accounts, setAccounts] = useState<IUpiAccount[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Rotation Strategy Setting
  const [strategy, setStrategy] = useState<UpiRotationStrategy>('round_robin');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [provider, setProvider] = useState('ICICI Merchant Banking');
  const [priority, setPriority] = useState(1);
  const [weight, setWeight] = useState(1);
  const [dailyTxLimit, setDailyTxLimit] = useState(50);
  const [dailyColLimit, setDailyColLimit] = useState(1000000);
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [submitting, setSubmitting] = useState(false);

  const fetchUpiData = async () => {
    try {
      setLoading(true);
      const [accRes, logRes] = await Promise.all([
        fetch('/api/admin/upi'),
        fetch('/api/admin/upi/logs?limit=15'),
      ]);

      const accJson = await accRes.json();
      const logJson = await logRes.json();

      if (accJson.success) {
        setAccounts(accJson.accounts || []);
        setStats(accJson.stats || {});
      }
      if (logJson.success) {
        setLogs(logJson.logs || []);
      }
    } catch (err) {
      console.error('Failed to load UPI data:', err);
      toast.error('Failed to load UPI management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpiData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setUpiId('');
    setDisplayName('');
    setProvider('ICICI Merchant Banking');
    setPriority(1);
    setWeight(1);
    setDailyTxLimit(50);
    setDailyColLimit(1000000);
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEditModal = (acc: IUpiAccount) => {
    setEditingId(acc._id);
    setUpiId(acc.upiId);
    setDisplayName(acc.displayName);
    setProvider(acc.provider);
    setPriority(acc.priority || 1);
    setWeight(acc.weight || 1);
    setDailyTxLimit(acc.dailyTransactionLimit || 50);
    setDailyColLimit(acc.dailyCollectionLimit || 1000000);
    setStatus(acc.status || 'active');
    setShowModal(true);
  };

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId || !displayName) {
      toast.error('UPI ID and Display Name are required');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId ? `/api/admin/upi/${editingId}` : '/api/admin/upi';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiId,
          displayName,
          provider,
          status,
          priority: Number(priority),
          weight: Number(weight),
          dailyTransactionLimit: Number(dailyTxLimit),
          dailyCollectionLimit: Number(dailyColLimit),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Operation failed');
        setSubmitting(false);
        return;
      }

      toast.success(editingId ? 'UPI Account updated!' : 'Merchant UPI Account created!');
      setShowModal(false);
      fetchUpiData();
    } catch {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (acc: IUpiAccount) => {
    const newStatus = acc.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/upi/${acc._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Account ${acc.displayName} set to ${newStatus}`);
        fetchUpiData();
      }
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleDeleteUpi = async (id: string) => {
    if (!confirm('Are you sure you want to delete this UPI account?')) return;
    try {
      const res = await fetch(`/api/admin/upi/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('UPI Account removed');
        fetchUpiData();
      }
    } catch {
      toast.error('Failed to delete UPI account');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dynamic UPI Management & Rotation"
        description="Configure institutional merchant UPI accounts, daily transaction limits, and dynamic assignment rules."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'UPI Management' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchUpiData} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Stats
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpenAddModal} className="font-bold gap-1.5">
              <Plus className="w-4 h-4" /> Add Merchant UPI ID
            </Button>
          </div>
        }
      />

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Merchant Accounts
          </span>
          <div className="text-2xl font-black text-[#142B4A]">
            {stats.totalAccounts || 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">
            {stats.activeAccounts || 0} Actively Rotating
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Today&apos;s Collection
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(stats.todayCollected || 0)}
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.todayTransactions || 0} Transactions today
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Lifetime Collection
          </span>
          <div className="text-2xl font-black text-[#142B4A]">
            {formatCurrency(stats.totalCollected || 0)}
          </div>
          <p className="text-[11px] text-slate-400">Total settled via UPI rotation</p>
        </div>

        {/* Active Rotation Engine Setting */}
        <div className="bg-gradient-to-br from-[#142B4A] to-[#2563EB] text-white p-5 rounded-2xl shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
            Active Rotation Strategy
          </span>
          <select
            value={strategy}
            onChange={(e) => {
              setStrategy(e.target.value as UpiRotationStrategy);
              toast.success(`Rotation strategy set to: ${e.target.value}`);
            }}
            className="w-full text-xs font-bold py-2 px-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none"
          >
            <option value="round_robin" className="text-slate-900">
              Round Robin (Deterministic)
            </option>
            <option value="least_used" className="text-slate-900">
              Least-Used (Collection Balance)
            </option>
            <option value="weighted" className="text-slate-900">
              Weighted Rotation
            </option>
            <option value="priority" className="text-slate-900">
              Manual Priority Selection
            </option>
          </select>
          <span className="text-[10px] text-blue-200/80 block">
            * Concurrency-safe atomic MongoDB allocation
          </span>
        </div>
      </div>

      {/* ─── Merchant UPI Accounts Table ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#142B4A]">Configured Merchant UPI Destinations</h3>
          <span className="text-xs text-slate-400">{accounts.length} Total Accounts</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <LoadingSpinner size="md" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No merchant UPI accounts added yet.</p>
            <Button size="sm" variant="secondary" onClick={handleOpenAddModal} className="font-bold">
              Add First UPI ID
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Merchant Display Name & ID</th>
                  <th className="py-3 px-4">Provider / Bank</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority / Weight</th>
                  <th className="py-3 px-4">Today&apos;s Usage</th>
                  <th className="py-3 px-4">Lifetime Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{acc.displayName}</div>
                      <div className="font-mono text-[11px] text-[#2563EB]">{acc.upiId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{acc.provider}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(acc)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-colors ${
                          acc.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {acc.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#142B4A]">P-{acc.priority}</span> • Weight: {acc.weight}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatCurrency(acc.currentDailyAmount || 0)}</div>
                      <div className="text-[10px] text-slate-400">
                        {acc.currentDailyCount || 0} / {acc.dailyTransactionLimit} txns
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#142B4A]">{formatCurrency(acc.totalCollection || 0)}</div>
                      <div className="text-[10px] text-slate-400">{acc.totalTransactions || 0} total orders</div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(acc)}
                        title="Edit"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpi(acc._id)}
                        title="Delete"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Real-Time Assignment Logs ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-bold text-sm text-[#142B4A]">Recent UPI Rotation Assignment Stream</h3>
          </div>
          <span className="text-xs text-slate-400">Live Audit Log</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No assignment logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Assigned Destination</th>
                  <th className="py-2.5 px-4">Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-medium text-slate-500">{formatDate(log.timestamp)}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{log.orderId}</td>
                    <td className="py-2.5 px-4">{log.customerId?.fullName || 'Customer'}</td>
                    <td className="py-2.5 px-4 font-bold text-[#142B4A]">{formatCurrency(log.amount)}</td>
                    <td className="py-2.5 px-4 font-mono text-[#2563EB]">{log.upiId}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-slate-600">
                      {log.strategyUsed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Add/Edit UPI Modal ─────────────────────────────────── */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Merchant UPI Account' : 'Add Merchant UPI Destination'}
          description="Enter authorized institutional merchant banking details for customer investment rotation."
        >
          <form onSubmit={handleSaveUpi} className="space-y-4 pt-2">
            <FormInput
              label="UPI ID (VPA)"
              placeholder="e.g. landvest.merchant1@icici"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={!!editingId}
              required
            />

            <FormInput
              label="Merchant Display Name"
              placeholder="e.g. LandVest Agro Escrow A"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

            <FormInput
              label="Provider / Bank Name"
              placeholder="e.g. ICICI Merchant Banking"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Priority (Higher = Priority)"
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                required
              />
              <FormInput
                label="Weight (for Weighted Rotation)"
                type="number"
                min="1"
                max="10"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Daily Txn Count Limit"
                type="number"
                min="1"
                value={dailyTxLimit}
                onChange={(e) => setDailyTxLimit(Number(e.target.value))}
                required
              />
              <FormInput
                label="Daily Collection Limit (₹)"
                type="number"
                min="1000"
                value={dailyColLimit}
                onChange={(e) => setDailyColLimit(Number(e.target.value))}
                required
              />
            </div>

            <FormSelect
              label="Account Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'active', label: 'Active (Included in rotation)' },
                { value: 'inactive', label: 'Inactive (Excluded from rotation)' },
                { value: 'suspended', label: 'Suspended (Maintenance)' },
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary" size="sm" loading={submitting} className="font-bold">
                {editingId ? 'Save Changes' : 'Create Merchant Account'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

