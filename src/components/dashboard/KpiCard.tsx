import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { MetricAssessment, WidgetGuideContent } from '@/content/dashboardGuides';
import { DeviationBadge, WidgetGuide } from '@/components/dashboard/WidgetGuide';
import {
  DASHBOARD_CARD_BODY_CLASS,
  DASHBOARD_CARD_CONTENT_CLASS,
  DashboardCardSubtitle,
} from '@/components/dashboard/dashboardCardLayout';
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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <CardTitle className="text-base font-medium leading-none tracking-tight">{title}</CardTitle>
            <DashboardCardSubtitle reserveSpace={subtitle == null}>{subtitle}</DashboardCardSubtitle>
          </div>
          {icon && (
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm',
                theme.iconChip,
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={DASHBOARD_CARD_CONTENT_CLASS}>
        <div className={cn(DASHBOARD_CARD_BODY_CLASS, 'space-y-2')}>
          <div className={cn('text-2xl font-medium tracking-tight', theme.value)}>{value}</div>
          {assessment && <DeviationBadge status={assessment.status} text={assessment.deviation} />}
        </div>
        {guide && <WidgetGuide guide={guide} pinned variant="embedded" />}
      </CardContent>
    </div>
  );
}
