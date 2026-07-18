import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const variants = {
  default: 'bg-secondary text-secondary-foreground',
  success:
    'bg-success-container text-success-container-foreground dark:bg-success-container dark:text-success-container-foreground',
  warning:
    'bg-warning-container text-warning-container-foreground dark:bg-warning-container dark:text-warning-container-foreground',
  destructive: 'bg-destructive/15 text-destructive dark:bg-destructive/20',
  outline: 'border border-input text-foreground',
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
