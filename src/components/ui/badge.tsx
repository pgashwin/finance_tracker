import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const variants = {
  default: 'bg-secondary-container text-secondary-container-foreground',
  success: 'bg-success-container text-success-container-foreground',
  warning: 'bg-warning-container text-warning-container-foreground',
  destructive: 'bg-destructive-container text-destructive-container-foreground',
  outline: 'border border-outline-variant text-foreground bg-surface-container-lowest',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
