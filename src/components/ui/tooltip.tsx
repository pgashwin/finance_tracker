import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** Hover and keyboard-focus tooltip for compact controls. */
export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 rounded-lg border border-outline-variant/40 bg-surface-container-high px-3 py-2 text-center text-xs leading-snug text-foreground opacity-0 shadow-md transition-opacity duration-short group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
