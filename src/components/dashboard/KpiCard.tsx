import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { MetricAssessment, WidgetGuideContent } from '@/content/dashboardGuides';
import { DeviationBadge, WidgetGuide } from '@/components/dashboard/WidgetGuide';
import { dynamicCardTheme } from '@/utils/dynamicCardTheme';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  guide?: WidgetGuideContent;
  assessment?: Pick<MetricAssessment, 'deviation' | 'status'>;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend = 'neutral',
  icon,
  guide,
  assessment,
}: KpiCardProps) {
  const theme = dynamicCardTheme(assessment?.status, trend);

  return (
    <div className={cn('md-dynamic-card flex h-full flex-col overflow-hidden', theme.card, theme.border)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-80">{title}</CardTitle>
        {icon && (
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full shadow-sm',
              theme.iconChip,
            )}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-0">
        <div className="space-y-2">
          <div className={cn('text-2xl font-medium tracking-tight', theme.value)}>{value}</div>
          {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
          {assessment && <DeviationBadge status={assessment.status} text={assessment.deviation} />}
        </div>
        {guide && <WidgetGuide guide={guide} pinned className="mt-0" variant="embedded" />}
      </CardContent>
    </div>
  );
}
