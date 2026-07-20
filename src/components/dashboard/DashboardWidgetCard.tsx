import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import { cn } from '@/lib/utils';

interface DashboardWidgetCardProps {
  title: string;
  subtitle?: ReactNode;
  guide?: WidgetGuideContent;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Dashboard card with main content on top and WidgetGuide pinned to the bottom. */
export function DashboardWidgetCard({
  title,
  subtitle,
  guide,
  children,
  className,
  contentClassName,
}: DashboardWidgetCardProps) {
  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle}
      </CardHeader>
      <CardContent className={cn('flex flex-1 flex-col gap-6', contentClassName)}>
        <div className="min-h-0 flex-1">{children}</div>
        {guide && <WidgetGuide guide={guide} pinned className="mt-0" />}
      </CardContent>
    </Card>
  );
}
