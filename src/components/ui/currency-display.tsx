'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colored?: boolean; // Green for positive, red for negative
  compact?: boolean; // 1.2M, 50L etc
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  className,
  size = 'md',
  colored = false,
}) => {
  const sizeClasses = {
    sm: 'text-xs font-medium',
    md: 'text-sm font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-bold tracking-tight',
  };

  const colorClass = colored
    ? amount > 0
      ? 'text-emerald-600'
      : amount < 0
      ? 'text-rose-600'
      : 'text-slate-600'
    : 'text-slate-900';

  return (
    <span className={cn('tabular-nums', sizeClasses[size], colorClass, className)}>
      {formatCurrency(amount)}
    </span>
  );
};
