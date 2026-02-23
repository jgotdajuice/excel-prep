import { clsx } from 'clsx';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:brightness-110',
  secondary: 'bg-brand-light text-brand-dark border border-brand hover:bg-brand-light/80',
  ghost: 'bg-transparent text-muted border border-border hover:bg-base',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 text-sm font-semibold rounded-btn transition-colors duration-150 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
