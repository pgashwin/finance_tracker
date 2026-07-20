import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
import {
  DASHBOARD_CARD_BODY_CLASS,
  DASHBOARD_CARD_CONTENT_CLASS,
  DashboardCardSubtitle,
} from '@/components/dashboard/dashboardCardLayout';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import { cn } from '@/lib/utils';

interface DashboardWidgetCardProps {
  title: string;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  guide?: WidgetGuideContent;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Dashboard card with aligned header, growing body, and guide pinned to the bottom. */
export function DashboardWidgetCard({
  title,
  subtitle,
  subtitleClassName,
  guide,
  children,
  className,
  contentClassName,
}: DashboardWidgetCardProps) {
  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <DashboardCardSubtitle reserveSpace={subtitle == null} className={subtitleClassName}>
          {subtitle}
        </DashboardCardSubtitle>
      </CardHeader>
      <CardContent className={cn(DASHBOARD_CARD_CONTENT_CLASS, contentClassName)}>
        <div className={DASHBOARD_CARD_BODY_CLASS}>{children}</div>
        {guide && <WidgetGuide guide={guide} pinned />}
      </CardContent>
    </Card>
  );
}
