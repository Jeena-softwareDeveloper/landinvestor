'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  CreditCard,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ICustomer } from '@/types';

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [customer, setCustomer] = useState<ICustomer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [investments, setInvestments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyReturns, setDailyReturns] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${id}`);
      const json = await res.json();
      if (json.success) {
        setCustomer(json.customer);
        setStats(json.stats || {});
        setInvestments(json.investments || []);
        setTransactions(json.transactions || []);
        setDailyReturns(json.dailyReturns || []);
        setWithdrawals(json.withdrawals || []);
      } else {
        toast.error(json.message || 'Customer not found');
        router.push('/customers');
      }
    } catch {
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  if (loading || !customer) {
    return <LoadingSpinner text="Loading investor portfolio..." className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.fullName}
        description={`Customer ID: ${customer.customerId} • Joined ${formatDate(customer.createdAt)}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Customers', href: '/customers' },
          { label: customer.fullName },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/investments/new?customerId=${customer._id}`}>
              <Button className="bg-[#142B4A] hover:bg-[#1a3a62]">
                <Plus className="w-4 h-4 mr-1.5" /> New Investment
              </Button>
            </Link>
            <Link href={`/customers/${customer._id}/edit`}>
              <Button variant="outline">Edit Profile</Button>
            </Link>
          </div>
        }
      />

      {/* Top Portfolio Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Total Capital
          </span>
          <h4 className="text-xl font-bold text-[#142B4A] mt-1">
            {formatCurrency(stats.totalInvestments || 0)}
          </h4>
          <span className="text-[10px] text-slate-400">All-time invested</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Active Holdings
          </span>
          <h4 className="text-xl font-bold text-blue-600 mt-1">
            {formatCurrency(stats.activeInvestments || 0)}
          </h4>
          <span className="text-[10px] text-slate-400">Currently generating yield</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Total Yield Accrued
          </span>
          <h4 className="text-xl font-bold text-amber-600 mt-1">
            {formatCurrency(stats.totalReturnsAccrued || 0)}
          </h4>
          <span className="text-[10px] text-slate-400">Calculated rental returns</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Returns Paid
          </span>
          <h4 className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(stats.totalReturnsPaid || 0)}
          </h4>
          <span className="text-[10px] text-slate-400">Transferred to customer</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Pending Withdrawals
          </span>
          <h4 className="text-xl font-bold text-rose-600 mt-1">
            {formatCurrency(stats.pendingWithdrawals || 0)}
          </h4>
          <span className="text-[10px] text-slate-400">Unsettled requests</span>
        </div>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="overview">
        <TabList className="bg-white px-4 rounded-t-xl border border-slate-200 border-b-0">
          <TabTrigger value="overview">Profile & Bank Details</TabTrigger>
          <TabTrigger value="investments" count={investments.length}>
            Investments
          </TabTrigger>
          <TabTrigger value="transactions" count={transactions.length}>
            Transactions
          </TabTrigger>
          <TabTrigger value="returns" count={dailyReturns.length}>
            Daily Returns
          </TabTrigger>
          <TabTrigger value="withdrawals" count={withdrawals.length}>
            Withdrawals
          </TabTrigger>
        </TabList>

        {/* Tab 1: Overview */}
        <TabContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-b-xl border border-slate-200 shadow-sm">
            {/* Left: Profile Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#142B4A] uppercase tracking-wider border-b border-slate-100 pb-2">
                Investor Profile
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Customer ID</span>
                  <span className="font-mono font-bold text-slate-800">{customer.customerId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-medium text-slate-800">{customer.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Phone Number</span>
                  <span className="font-medium text-slate-800">{customer.mobile}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">KYC Status</span>
                  <StatusBadge status={customer.kycStatus} />
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Account Status</span>
                  <StatusBadge status={customer.accountStatus} />
                </div>
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-medium block mb-1">
                    Registered Address
                  </span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    {customer.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Bank & UPI Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#142B4A] uppercase tracking-wider border-b border-slate-100 pb-2">
                Settlement & Payout Accounts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Bank Account Details</span>
                  </div>
                  <div className="text-xs space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Holder:</span>
                      <span className="font-medium text-slate-800">
                        {customer.bankDetails?.accountHolderName || customer.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-medium text-slate-800">
                        {customer.bankDetails?.bankName || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Number:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {customer.bankDetails?.accountNumber || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {customer.bankDetails?.ifscCode || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      Registered UPI ID
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {customer.upiId || 'Not registered'}
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                    Instant Payout Eligible
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabContent>

        {/* Tab 2: Investments */}
        <TabContent value="investments">
          <div className="bg-white rounded-b-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">Land Property</th>
                  <th className="py-3 px-4 text-right">Investment Amount</th>
                  <th className="py-3 px-4 text-right">Daily Return</th>
                  <th className="py-3 px-4 text-right">Total Accrued</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investments.length > 0 ? (
                  investments.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {inv.landId?.name || 'Land Property'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                        {formatCurrency(inv.dailyAccruedReturn || 0)}/day
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {formatCurrency(inv.totalAccruedReturn || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(inv.startDate)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/investments/${inv._id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No investments found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabContent>

        {/* Tab 3: Transactions */}
        <TabContent value="transactions">
          <div className="bg-white rounded-b-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Reference / UTR</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(tx.transactionDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold uppercase text-slate-800">{tx.type}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{tx.upiReference}</td>
                      <td className="py-3.5 px-4 uppercase text-slate-500">{tx.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabContent>

        {/* Tab 4: Daily Returns */}
        <TabContent value="returns">
          <div className="bg-white rounded-b-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Land Asset</th>
                  <th className="py-3 px-4 text-right">Principal</th>
                  <th className="py-3 px-4 text-right">Yield Rate</th>
                  <th className="py-3 px-4 text-right">Accrued Return</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyReturns.length > 0 ? (
                  dailyReturns.map((dr) => (
                    <tr key={dr._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 text-slate-700">{formatDate(dr.date)}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {dr.landId?.name || 'Land Property'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(dr.investmentAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                        {dr.returnRate}%/day
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        {formatCurrency(dr.dailyReturnAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={dr.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No return calculations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabContent>

        {/* Tab 5: Withdrawals */}
        <TabContent value="withdrawals">
          <div className="bg-white rounded-b-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Available Balance</th>
                  <th className="py-3 px-4">UPI / Destination</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.length > 0 ? (
                  withdrawals.map((wd) => (
                    <tr key={wd._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 text-slate-700">{formatDate(wd.requestDate)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        {formatCurrency(wd.requestedAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(wd.availableBalance)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{wd.upiId || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {wd.paymentReference || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={wd.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No withdrawal requests from this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabContent>
      </Tabs>
    </div>
  );
}
