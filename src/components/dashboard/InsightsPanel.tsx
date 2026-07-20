import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { Insight } from '@/types';
import { Link } from 'react-router-dom';

interface Props {
  insights: Insight[];
  guide?: WidgetGuideContent;
}

const severityVariant = {
  info: 'outline' as const,
  warning: 'warning' as const,
  success: 'success' as const,
};

const severityIcon = {
  info: 'info',
  warning: 'warning',
  success: 'check_circle',
} as const;

export function InsightsPanel({ insights, guide }: Props) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Insights & Alerts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="min-h-0 flex-1 space-y-3">
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add financial data to get personalized insights.</p>
          ) : (
            insights.map((insight, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 transition-colors duration-short hover:bg-surface-container sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Icon
                      name={severityIcon[insight.severity]}
                      size="xs"
                      filled
                      className={
                        insight.severity === 'success'
                          ? 'text-success'
                          : insight.severity === 'warning'
                            ? 'text-warning'
                            : 'text-primary'
                      }
                    />
                    <Badge variant={severityVariant[insight.severity]}>{insight.severity}</Badge>
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                {insight.actionRoute && (
                  <Link
                    to={insight.actionRoute}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View
                    <Icon name="arrow_forward" size="xs" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
        {guide && <WidgetGuide guide={guide} pinned className="mt-0" />}
      </CardContent>
    </Card>
  );
}
