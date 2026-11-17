'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  Upload,
  Eye,
  AlertTriangle,
  FileText,
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
  const [savingStrategy, setSavingStrategy] = useState(false);

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
  const [qrCode, setQrCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<IUpiAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  // QR Code Preview Modal
  const [previewAccount, setPreviewAccount] = useState<IUpiAccount | null>(null);

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
        if (accJson.activeStrategy) {
          setStrategy(accJson.activeStrategy);
        }
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

  const handleStrategyChange = async (newStrategy: UpiRotationStrategy) => {
    setStrategy(newStrategy);
    try {
      setSavingStrategy(true);
      const res = await fetch('/api/admin/upi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: newStrategy }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Active strategy saved: ${newStrategy.replace('_', ' ').toUpperCase()}`);
      } else {
        toast.error(json.message || 'Failed to save strategy');
      }
    } catch {
      toast.error('Failed to update rotation strategy');
    } finally {
      setSavingStrategy(false);
    }
  };

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
    setQrCode('');
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
    setQrCode(acc.qrCode || '');
    setShowModal(true);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingQr(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'merchant-upi-qr');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setQrCode(data.url);
        toast.success('Merchant QR code uploaded successfully!');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Failed to upload QR image');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = upiId.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!cleanUpi || !cleanName) {
      toast.error('UPI ID (VPA) and Display Name are required');
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
          upiId: cleanUpi,
          displayName: cleanName,
          provider: provider.trim(),
          status,
          priority: Math.max(1, Number(priority)),
          weight: Math.max(1, Number(weight)),
          dailyTransactionLimit: Math.max(1, Number(dailyTxLimit)),
          dailyCollectionLimit: Math.max(1000, Number(dailyColLimit)),
          qrCode,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Operation failed');
        setSubmitting(false);
        return;
      }

      toast.success(editingId ? 'Merchant UPI Account updated!' : 'Merchant UPI Account created!');
      setShowModal(false);
      fetchUpiData();
    } catch {
      toast.error('An error occurred while saving UPI account');
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
        toast.success(`Account "${acc.displayName}" is now ${newStatus.toUpperCase()}`);
        setAccounts((prev) =>
          prev.map((a) => (a._id === acc._id ? { ...a, status: newStatus } : a))
        );
      } else {
        toast.error(json.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleQuickPriorityChange = async (acc: IUpiAccount, delta: number) => {
    const newPriority = Math.max(1, (acc.priority || 1) + delta);
    if (newPriority === acc.priority) return;

    try {
      const res = await fetch(`/api/admin/upi/${acc._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Priority for "${acc.displayName}" updated to P-${newPriority}`);
        fetchUpiData();
      } else {
        toast.error(json.message || 'Failed to update priority');
      }
    } catch {
      toast.error('Failed to adjust priority');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/upi/${deleteTarget._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'UPI Account removed successfully');
        setDeleteTarget(null);
        fetchUpiData();
      } else {
        toast.error(json.message || 'Failed to delete UPI account');
      }
    } catch {
      toast.error('Failed to delete UPI account');
    } finally {
      setDeleting(false);
    }
  };

  const generatedPreviewQr = upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(
        `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(displayName.trim() || 'LandVest Merchant')}&cu=INR`
      )}`
    : '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dynamic UPI Management & Rotation"
        description="Configure institutional merchant UPI accounts, priority rotation rules, and transaction limits."
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
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
              Active Rotation Strategy
            </span>
            {savingStrategy && <LoadingSpinner size="sm" />}
          </div>
          <select
            value={strategy}
            disabled={savingStrategy}
            onChange={(e) => handleStrategyChange(e.target.value as UpiRotationStrategy)}
            className="w-full text-xs font-bold py-2 px-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none cursor-pointer"
          >
            <option value="round_robin" className="text-slate-900">
              Round Robin (Deterministic)
            </option>
            <option value="priority" className="text-slate-900">
              Manual Priority Selection (P-High First)
            </option>
            <option value="least_used" className="text-slate-900">
              Least-Used (Collection Balance)
            </option>
            <option value="weighted" className="text-slate-900">
              Weighted Rotation
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
          <div>
            <h3 className="font-bold text-sm text-[#142B4A]">Configured Merchant UPI Destinations</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click edit to modify VPA, priority, or limits. Click delete to remove from rotation.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            {accounts.length} Total Accounts
          </span>
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
                  <th className="py-3 px-4">Merchant Display Name &amp; ID</th>
                  <th className="py-3 px-4">Provider / Bank</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority / Weight</th>
                  <th className="py-3 px-4">Today&apos;s Usage</th>
                  <th className="py-3 px-4">Lifetime Total</th>
                  <th className="py-3 px-4 text-center">QR Code</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{acc.displayName}</div>
                      <div className="font-mono text-[11px] text-[#2563EB] flex items-center gap-1.5 mt-0.5">
                        <span>{acc.upiId}</span>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="py-3.5 px-4 font-medium text-slate-600">{acc.provider}</td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(acc)}
                        title="Click to toggle status"
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-colors ${
                          acc.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {acc.status}
                      </button>
                    </td>

                    {/* Priority & Quick Adjust */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          P-{acc.priority}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleQuickPriorityChange(acc, 1)}
                            title="Increase Priority"
                            className="p-0.5 hover:text-blue-600 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleQuickPriorityChange(acc, -1)}
                            title="Decrease Priority"
                            className="p-0.5 hover:text-blue-600 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">W: {acc.weight}</span>
                      </div>
                    </td>

                    {/* Today Usage */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatCurrency(acc.currentDailyAmount || 0)}</div>
                      <div className="text-[10px] text-slate-400">
                        {acc.currentDailyCount || 0} / {acc.dailyTransactionLimit} txns
                      </div>
                    </td>

                    {/* Lifetime Total */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#142B4A]">{formatCurrency(acc.totalCollection || 0)}</div>
                      <div className="text-[10px] text-slate-400">{acc.totalTransactions || 0} total orders</div>
                    </td>

                    {/* QR Code Preview Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setPreviewAccount(acc)}
                        title="View Scannable QR Code"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        <span>QR</span>
                      </button>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(acc)}
                          title="Edit Merchant UPI Account"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(acc)}
                          title="Delete Merchant Account"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
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

      {/* ─── Add / Edit UPI Modal ───────────────────────────────── */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Merchant UPI Account' : 'Add Merchant UPI Destination'}
          description="Enter authorized institutional merchant banking details for customer investment rotation."
        >
          <form onSubmit={handleSaveUpi} className="space-y-4 pt-2">
            <div>
              <FormInput
                label="UPI ID (VPA)"
                placeholder="e.g. landvest.merchant1@icici"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                helperText="Fully editable. Unique NPCI virtual payment address."
                required
              />
            </div>

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
                label="Priority (Higher = P-High first)"
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                helperText="1 (Low) to 10 (Highest priority)"
                required
              />
              <FormInput
                label="Weight (Weighted Rotation)"
                type="number"
                min="1"
                max="10"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                helperText="Relative assignment weight"
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
                { value: 'active', label: 'Active (Included in live rotation)' },
                { value: 'inactive', label: 'Inactive (Excluded from rotation)' },
                { value: 'suspended', label: 'Suspended (Maintenance)' },
              ]}
            />

            {/* Custom QR Code Upload / Preview */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Merchant QR Code</span>
                </label>
                <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingQr ? 'Uploading…' : 'Upload QR Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    disabled={uploadingQr}
                    className="hidden"
                  />
                </label>
              </div>

              {qrCode ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                  <img src={qrCode} alt="Custom QR" className="w-16 h-16 object-contain rounded border" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 block truncate">Custom QR Image Uploaded</span>
                    <button
                      type="button"
                      onClick={() => setQrCode('')}
                      className="text-[10px] text-red-600 hover:underline mt-0.5"
                    >
                      Remove custom QR (use auto-generator)
                    </button>
                  </div>
                </div>
              ) : generatedPreviewQr ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                  <img src={generatedPreviewQr} alt="Live QR Preview" className="w-16 h-16 object-contain rounded border" />
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-emerald-700 block">Auto-Generated Dynamic QR Active</span>
                    <span className="text-[10px] text-slate-400">Scannable by GPay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
              ) : null}
            </div>

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

      {/* ─── Delete Confirmation Modal ─────────────────────────── */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Merchant UPI Account"
          description="Are you sure you want to remove this merchant UPI destination?"
        >
          <div className="space-y-4 pt-2">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Permanent Deletion Warning</p>
                <p className="text-red-700">
                  You are about to delete <strong>{deleteTarget.displayName}</strong> (<span className="font-mono">{deleteTarget.upiId}</span>). It will immediately be excluded from future customer rotation assignments.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                loading={deleting}
                onClick={handleConfirmDelete}
                className="font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Live Scannable QR Code Modal ────────────────────────── */}
      {previewAccount && (
        <Modal
          isOpen={!!previewAccount}
          onClose={() => setPreviewAccount(null)}
          title={`Scan & Test: ${previewAccount.displayName}`}
          description={`Merchant VPA: ${previewAccount.upiId}`}
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-64 h-64 mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
              <img
                src={
                  previewAccount.qrCode ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(
                    `upi://pay?pa=${previewAccount.upiId}&pn=${encodeURIComponent(previewAccount.displayName)}&cu=INR`
                  )}`
                }
                alt="Merchant UPI QR"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <div className="font-mono font-bold text-sm text-[#142B4A] bg-blue-50 py-1 px-3 rounded-lg border border-blue-200 inline-block">
                {previewAccount.upiId}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {previewAccount.provider} • Priority: P-{previewAccount.priority} • Weight: {previewAccount.weight}
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewAccount(null)}
                className="w-full"
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
