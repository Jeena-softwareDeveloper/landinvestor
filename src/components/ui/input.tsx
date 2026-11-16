'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-[#1E293B]"
          >
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400 z-10 w-5 h-5">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={cn(
              'block w-full h-11 rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#1E293B] placeholder:text-slate-400',
              'transition-all duration-200 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-red-400 bg-red-50/20 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-300 hover:border-slate-400 focus:ring-[#2563EB]/20 focus:border-[#2563EB]',
              leftIcon ? '!pl-11' : '',
              rightIcon ? '!pr-11' : '',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-75',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 z-10">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-[#64748B]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

export { FormInput };
