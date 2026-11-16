'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    { className, containerClassName, label, error, helperText, id, ...props },
    ref
  ) => {
    const textareaId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-[#1E293B]"
          >
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          className={cn(
            'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#1E293B] placeholder:text-slate-400',
            'transition-all duration-200 resize-y min-h-[90px] shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-400 bg-red-50/20 focus:ring-red-500/20 focus:border-red-500'
              : 'border-slate-300 hover:border-slate-400 focus:ring-[#2563EB]/20 focus:border-[#2563EB]',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-75',
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-xs font-medium text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${textareaId}-helper`} className="text-xs text-[#64748B]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
FormTextarea.displayName = 'FormTextarea';

export { FormTextarea };
