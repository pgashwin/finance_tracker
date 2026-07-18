import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { MaturityItem } from '@/services/analytics/netWorth';
import { formatINR, formatDate } from '@/utils/currency';

interface Props {
  items: MaturityItem[];
  guide?: WidgetGuideContent;
}

export function UpcomingMaturities({ items, guide }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Maturities (90 days)</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No maturities in the next 90 days.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">
                    {item.type} · {formatDate(item.date)}
                  </p>
                </div>
                <span className="font-semibold">{formatINR(item.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
