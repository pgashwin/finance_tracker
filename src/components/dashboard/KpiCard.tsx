import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { MetricAssessment, WidgetGuideContent } from '@/content/dashboardGuides';
import { DeviationBadge, WidgetGuide } from '@/components/dashboard/WidgetGuide';

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
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div
          className={cn(
            'text-2xl font-bold',
            trend === 'positive' && 'text-green-600 dark:text-green-400',
            trend === 'negative' && 'text-red-600 dark:text-red-400',
          )}
        >
          {value}
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        {assessment && <DeviationBadge status={assessment.status} text={assessment.deviation} />}
        {guide && <WidgetGuide guide={guide} className="mt-3" />}
      </CardContent>
    </Card>
  );
}
