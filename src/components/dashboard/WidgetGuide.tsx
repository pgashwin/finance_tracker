import { cn } from '@/lib/utils';
import type { DeviationStatus, WidgetGuideContent } from '@/content/dashboardGuides';
import { Info } from 'lucide-react';

const statusStyles: Record<DeviationStatus, string> = {
  good: 'text-green-700 dark:text-green-400',
  warn: 'text-amber-700 dark:text-amber-400',
  bad: 'text-red-700 dark:text-red-400',
  neutral: 'text-muted-foreground',
  na: 'text-muted-foreground',
};

const statusLabel: Record<DeviationStatus, string> = {
  good: 'On track',
  warn: 'Needs attention',
  bad: 'Below ideal',
  neutral: 'Informational',
  na: 'Incomplete data',
};

interface WidgetGuideProps {
  guide: WidgetGuideContent;
  className?: string;
}

export function WidgetGuide({ guide, className }: WidgetGuideProps) {
  return (
    <div className={cn('mt-4 space-y-2 rounded-md border bg-muted/40 p-3 text-xs', className)}>
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground">{guide.summary}</p>
      </div>
      <p>
        <span className="font-medium text-foreground">How: </span>
        <span className="text-muted-foreground">{guide.formula}</span>
      </p>
      <p>
        <span className="font-medium text-foreground">Ideal: </span>
        <span className="text-muted-foreground">{guide.ideal}</span>
      </p>
    </div>
  );
}

interface DeviationBadgeProps {
  status: DeviationStatus;
  text: string;
}

export function DeviationBadge({ status, text }: DeviationBadgeProps) {
  return (
    <p className={cn('mt-2 text-xs font-medium', statusStyles[status])}>
      {statusLabel[status]} — {text}
    </p>
  );
}

interface MetricGuideRowProps {
  label: string;
  value: string;
  ideal: string;
  deviation: string;
  status: DeviationStatus;
}

export function MetricGuideRow({ label, value, ideal, deviation, status }: MetricGuideRowProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <dt className="text-sm font-medium">{label}</dt>
        <dd className="text-lg font-semibold">{value}</dd>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Ideal: {ideal}</p>
      <DeviationBadge status={status} text={deviation} />
    </div>
  );
}
