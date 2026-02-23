import { clsx } from 'clsx';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  shadow?: boolean;
}

export function Card({
  padding = true,
  shadow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-card',
        padding && 'p-6',
        shadow && 'shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
