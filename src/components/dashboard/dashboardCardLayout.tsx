import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** Shared flex layout: main body grows, guide stays at the bottom of stretched cards. */
export const DASHBOARD_CARD_CONTENT_CLASS = 'flex min-h-0 flex-1 flex-col gap-6 pt-0';
export const DASHBOARD_CARD_BODY_CLASS = 'min-h-0 flex-1';

interface DashboardCardSubtitleProps {
  children?: ReactNode;
  /** Reserve one subtitle line so card headers align in a row */
  reserveSpace?: boolean;
  className?: string;
}

export function DashboardCardSubtitle({
  children,
  reserveSpace = false,
  className,
}: DashboardCardSubtitleProps) {
  if (!children && reserveSpace) {
    return <div className="min-h-5" aria-hidden />;
  }
  if (!children) return null;

  return (
    <div className={cn('text-sm leading-snug text-muted-foreground', className)}>{children}</div>
  );
}
