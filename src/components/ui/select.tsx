'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  containerClassName?: string;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      placeholder,
      options,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-[#1E293B]"
          >
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            className={cn(
              'block w-full h-11 appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-[#1E293B]',
              'transition-all duration-200 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-red-400 bg-red-50/20 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-300 hover:border-slate-400 focus:ring-[#2563EB]/20 focus:border-[#2563EB]',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-75',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-xs font-medium text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-[#64748B]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
FormSelect.displayName = 'FormSelect';

export { FormSelect };
