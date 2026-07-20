import { cn } from '@/lib/utils';
import type { DeviationStatus, WidgetGuideContent } from '@/content/dashboardGuides';
import { Icon } from '@/components/ui/icon';
import { dynamicCardTheme } from '@/utils/dynamicCardTheme';

const statusStyles: Record<DeviationStatus, string> = {
  good: 'text-success',
  warn: 'text-warning',
  bad: 'text-destructive',
  neutral: 'text-secondary',
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
  variant?: 'default' | 'embedded';
  /** Pin to bottom of a flex column card (dashboard widgets). */
  pinned?: boolean;
}

export function WidgetGuide({ guide, className, variant = 'default', pinned = false }: WidgetGuideProps) {
  return (
    <div
      className={cn(
        'space-y-2 rounded-xl p-3 text-xs',
        pinned ? 'shrink-0' : 'mt-4',
        variant === 'embedded'
          ? 'border border-white/40 bg-white/50 backdrop-blur-sm'
          : 'rounded-2xl border border-outline-variant/30 bg-surface-container-low',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Icon name="info" size="xs" className="mt-0.5 shrink-0 text-primary" />
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
  const theme = dynamicCardTheme(status);

  return (
    <div className={cn('md-dynamic-card p-4', theme.card, theme.border)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <dt className="text-sm font-medium opacity-90">{label}</dt>
        <dd className={cn('text-lg font-medium', theme.value)}>{value}</dd>
      </div>
      <p className="mt-1 text-xs opacity-75">Ideal: {ideal}</p>
      <DeviationBadge status={status} text={deviation} />
    </div>
  );
}
