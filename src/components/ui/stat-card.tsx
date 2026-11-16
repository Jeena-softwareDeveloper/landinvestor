'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number; // e.g., +12.5 or -3.2
  changePeriod?: string; // e.g. "vs last month"
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'emerald' | 'cyan' | 'indigo' | 'rose';
  className?: string;
  prefix?: string;
  suffix?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100 text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-[#059669]',
    border: 'border-emerald-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100 text-purple-600',
    border: 'border-purple-100',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100 text-[#D97706]',
    border: 'border-amber-100',
  },
  cyan: {
    bg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100 text-cyan-600',
    border: 'border-cyan-100',
  },
  indigo: {
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100 text-indigo-600',
    border: 'border-indigo-100',
  },
  rose: {
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100 text-rose-600',
    border: 'border-rose-100',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changePeriod = 'vs last month',
  description,
  trend,
  color = 'blue',
  className,
  prefix,
  suffix,
}) => {
  const scheme = colorStyles[color] || colorStyles.blue;
  const isPositive = trend ? trend === 'up' : (change ?? 0) >= 0;
  const isNeutral = trend === 'neutral' || change === undefined || change === 0;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xl font-bold text-slate-800">{prefix}</span>}
            <h3 className="text-2xl font-bold text-[#142B4A] tracking-tight">
              {value}
            </h3>
            {suffix && <span className="text-sm font-medium text-slate-500">{suffix}</span>}
          </div>
        </div>
        <div className={cn('p-3 rounded-xl flex items-center justify-center shrink-0', scheme.iconBg)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(change !== undefined || description) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change !== undefined ? (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded',
                  isNeutral
                    ? 'text-slate-600 bg-slate-100'
                    : isPositive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-700 bg-rose-50'
                )}
              >
                {isNeutral ? (
                  <Minus className="w-3 h-3" />
                ) : isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {change > 0 ? `+${change}%` : `${change}%`}
              </span>
              <span className="text-slate-500">{changePeriod}</span>
            </div>
          ) : (
            <span className="text-slate-500">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
