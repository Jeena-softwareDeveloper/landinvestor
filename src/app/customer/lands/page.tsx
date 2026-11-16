'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building, MapPin, TrendingUp, Search, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { SearchInput } from '@/components/ui/search-input';
import { formatCurrency } from '@/lib/utils';
import { ILand } from '@/types';

export default function CustomerLandsPage() {
  const [lands, setLands] = useState<ILand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadLands() {
      try {
        const res = await fetch('/api/public/lands');
        const json = await res.json();
        if (json.success) {
          setLands(json.lands);
        }
      } catch (err) {
        console.error('Failed to load lands:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLands();
  }, []);

  const filteredLands = lands.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.surveyNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142B4A] tracking-tight">Available Land Parcels</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse legally cleared agricultural and commercial surveyed plots ready for fractional investment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search parcel by name or survey number..."
            className="w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-10 px-3 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="fully_funded">Fully Subscribed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredLands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Building className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No properties match your filter</h3>
          <p className="text-xs text-slate-400">Try adjusting your search keywords or clear the filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLands.map((land) => (
            <div
              key={land._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    land.coverImage ||
                    (land.images && land.images[0]) ||
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop'
                  }
                  alt={land.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#142B4A]/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                  {land.surveyNumber}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      land.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
                    }`}
                  >
                    {land.status === 'active' ? 'Open' : 'Subscribed'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#142B4A] tracking-tight group-hover:text-[#2563EB] transition-colors">
                    {land.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {land.location}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Funded: {land.investmentPercentage || 0}%</span>
                    <span>Target: {formatCurrency(land.totalValue)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, land.investmentPercentage || 0)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Min. Ticket</span>
                    <strong className="text-[#142B4A]">{formatCurrency(land.minInvestmentAmount || 50000)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Available</span>
                    <strong className="text-emerald-600">{formatCurrency(land.availableInvestment)}</strong>
                  </div>
                </div>

                <Link href={`/customer/lands/${land._id}`} className="block pt-1">
                  <Button variant="secondary" className="w-full font-bold text-xs justify-between">
                    <span>View Property & Invest</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

