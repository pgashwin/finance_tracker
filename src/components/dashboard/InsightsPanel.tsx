import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export function InsightsPanel({ insights, guide }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add financial data to get personalized insights.</p>
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={severityVariant[insight.severity]}>{insight.severity}</Badge>
                  <span className="font-medium">{insight.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
              {insight.actionRoute && (
                <Link
                  to={insight.actionRoute}
                  className="shrink-0 text-sm text-primary hover:underline"
                >
                  View →
                </Link>
              )}
            </div>
          ))
        )}
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
