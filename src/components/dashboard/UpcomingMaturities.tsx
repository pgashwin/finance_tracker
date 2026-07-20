import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { MaturityItem } from '@/services/analytics/netWorth';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/utils/currency';

interface Props {
  items: MaturityItem[];
  guide?: WidgetGuideContent;
}

export function UpcomingMaturities({ items, guide }: Props) {
  const { format } = useCurrency();

  return (
    <DashboardWidgetCard title="Upcoming Maturities (90 days)" guide={guide}>
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
              <span className="font-semibold">{format(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidgetCard>
  );
}
