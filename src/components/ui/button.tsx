'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#142B4A] text-white hover:bg-[#1a3a63] focus-visible:ring-[#142B4A] shadow-sm',
        secondary:
          'bg-[#2563EB] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#2563EB] shadow-sm',
        destructive:
          'bg-[#DC2626] text-white hover:bg-[#b91c1c] focus-visible:ring-[#DC2626] shadow-sm',
        outline:
          'border border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F5F7FA] focus-visible:ring-[#2563EB]',
        ghost:
          'text-[#1E293B] hover:bg-[#F5F7FA] focus-visible:ring-[#2563EB]',
        link:
          'text-[#2563EB] underline-offset-4 hover:underline focus-visible:ring-[#2563EB] p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        default: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : icon ? (
          <span className="shrink-0" aria-hidden="true">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="default" {...props} />
);
PrimaryButton.displayName = 'PrimaryButton';

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);
SecondaryButton.displayName = 'SecondaryButton';

export interface IconButtonProps extends ButtonProps {
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        'p-0',
        size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
        className
      )}
      {...props}
    />
  )
);
IconButton.displayName = 'IconButton';

export { Button, PrimaryButton, SecondaryButton, IconButton, buttonVariants };
