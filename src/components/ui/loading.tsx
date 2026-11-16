'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}> = ({ size = 'md', className, text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 gap-3', className)}>
      <Loader2 className={cn('animate-spin text-[#2563EB]', sizeClasses[size])} />
      {text && <p className="text-xs text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export const SkeletonText: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('h-4 bg-slate-200 animate-pulse rounded', className)} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white p-5 rounded-xl border border-slate-200 space-y-3', className)}>
    <div className="flex justify-between items-center">
      <div className="h-3 w-24 bg-slate-200 animate-pulse rounded" />
      <div className="h-8 w-8 bg-slate-200 animate-pulse rounded-lg" />
    </div>
    <div className="h-7 w-32 bg-slate-200 animate-pulse rounded" />
    <div className="h-3 w-40 bg-slate-100 animate-pulse rounded pt-2" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => (
  <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 animate-pulse rounded flex-1" />
      ))}
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="h-14 flex items-center px-4 gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-100 animate-pulse rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);
