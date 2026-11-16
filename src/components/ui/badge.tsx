'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-[#059669] border-emerald-200',
  inactive: 'bg-gray-50 text-gray-600 border-gray-200',
  pending: 'bg-amber-50 text-[#D97706] border-amber-200',
  rejected: 'bg-red-50 text-[#DC2626] border-red-200',
  completed: 'bg-blue-50 text-[#2563EB] border-blue-200',
  verified: 'bg-emerald-50 text-[#059669] border-emerald-200',
  suspended: 'bg-red-50 text-[#DC2626] border-red-200',
  processing: 'bg-blue-50 text-[#2563EB] border-blue-200',
  paid: 'bg-emerald-50 text-[#059669] border-emerald-200',
  approved: 'bg-emerald-50 text-[#059669] border-emerald-200',
  matured: 'bg-purple-50 text-purple-600 border-purple-200',
  cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
  fully_funded: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  accrued: 'bg-amber-50 text-[#D97706] border-amber-200',
  deposit: 'bg-emerald-50 text-[#059669] border-emerald-200',
  withdrawal: 'bg-orange-50 text-orange-600 border-orange-200',
  refund: 'bg-purple-50 text-purple-600 border-purple-200',
};

const defaultColor = 'bg-gray-50 text-gray-600 border-gray-200';

export interface StatusBadgeProps {
  status: string;
  className?: string;
  dot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, dot = true }) => {
  const normalizedStatus = status.toLowerCase().replace(/[\s-]/g, '_');
  const colorClasses = statusColors[normalizedStatus] || defaultColor;

  const label = status
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClasses,
        className
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
};
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge };
