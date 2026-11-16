'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm text-sm', className)}>
      <Calendar className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer"
      />
      <span className="text-xs text-slate-400 font-medium">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer pr-1"
      />
    </div>
  );
};

