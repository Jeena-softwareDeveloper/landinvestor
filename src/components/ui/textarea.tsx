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
            className="block text-sm font-medium text-[#1E293B]"
          >
            {label}
            {props.required && <span className="text-[#DC2626] ml-0.5">*</span>}
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
            'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#1E293B] placeholder:text-[#64748B]',
            'transition-colors duration-200 resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]'
              : 'border-[#E2E8F0] focus:ring-[#2563EB]/20 focus:border-[#2563EB]',
            'disabled:bg-[#F5F7FA] disabled:cursor-not-allowed disabled:opacity-60',
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-[#DC2626]" role="alert">
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
