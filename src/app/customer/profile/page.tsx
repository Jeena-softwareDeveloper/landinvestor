'use client';

import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, CreditCard, Building, Save, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';

export default function CustomerProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [upiId, setUpiId] = useState('');
  const [address, setAddress] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/customer/profile');
        const json = await res.json();
        if (json.success && json.customer) {
          const c = json.customer;
          setCustomer(c);
          setUpiId(c.upiId || '');
          setAddress(c.address || '');
          setStreet(c.addressDetails?.street || '');
          setCity(c.addressDetails?.city || '');
          setStateName(c.addressDetails?.state || '');
          setPincode(c.addressDetails?.pincode || '');
          setAccountHolderName(c.bankDetails?.accountHolderName || c.fullName || '');
          setAccountNumber(c.bankDetails?.accountNumber || '');
          setBankName(c.bankDetails?.bankName || '');
          setIfscCode(c.bankDetails?.ifscCode || '');
          setBranchName(c.bankDetails?.branchName || '');
        }
      } catch (err) {
        console.error('Failed to load customer profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
    } catch {
      // ignore
    }
    toast.success('Logged out successfully');
    window.location.href = '/customer/login';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          addressDetails: {
            street,
            city,
            state: stateName,
            pincode,
          },
          upiId,
          bankDetails: {
            accountHolderName,
            accountNumber,
            bankName,
            ifscCode,
            branchName,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to update profile');
        setSaving(false);
        return;
      }

      toast.success('Banking details & profile saved successfully!');
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">Investor Profile &amp; Banking</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified payout bank destination, KYC credentials, and contact details.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#142B4A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#2563EB]" />
              <span>Personal Identification</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {customer?.kycStatus || 'Verified'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Customer ID" value={customer?.customerId || '—'} disabled readOnly />
            <FormInput label="Full Legal Name" value={customer?.fullName || ''} disabled readOnly />
            <FormInput label="Mobile Number" value={customer?.mobile || ''} disabled readOnly />
            <FormInput label="Email Address" value={customer?.email || ''} disabled readOnly />
            <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Residential &amp; Deed Registration Address Data
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <FormInput
                    label="Street / Door No / Apartment"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 42, Sunrise Enclave, 12th Main Road"
                  />
                </div>
                <FormInput
                  label="City / Town"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                />
                <FormInput
                  label="State / Province"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Karnataka"
                />
                <FormInput
                  label="Postal Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 560001"
                />
                <FormInput
                  label="Full Combined Address String"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete registered address for legal land contracts"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking & Payout Destination */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#142B4A] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2563EB]" />
              <span>Payout Bank & UPI Destination</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Used when you request rental income return disbursements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormInput
                label="Primary UPI ID (for instant payouts)"
                placeholder="e.g. yourname@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
            <FormInput
              label="Bank Account Holder Name"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="As per bank passbook"
            />
            <FormInput
              label="Bank Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 50100234567890"
            />
            <FormInput
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC Bank"
            />
            <FormInput
              label="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0000053"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" loading={saving} className="font-bold gap-1.5">
              <Save className="w-4 h-4" /> Save Banking Details
            </Button>
          </div>
        </div>
      </form>

      {/* Account Session & Sign Out Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-[#142B4A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Investor Session</span>
          </h4>
          <p className="text-xs text-slate-500">
            Signed in as <strong className="text-slate-800 font-semibold">{customer?.fullName}</strong> ({customer?.email || customer?.mobile})
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out from Device</span>
        </button>
      </div>
    </div>
  );
}

