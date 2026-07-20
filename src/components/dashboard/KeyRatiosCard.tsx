import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { MetricGuideRow } from '@/components/dashboard/WidgetGuide';
import type { MetricAssessment, WidgetGuideContent } from '@/content/dashboardGuides';

interface Props {
  ratios: MetricAssessment[];
  pnl: MetricAssessment;
  guide: WidgetGuideContent;
}

export function KeyRatiosCard({ ratios, pnl, guide }: Props) {
  return (
    <DashboardWidgetCard
      title="Key Ratios"
      subtitle="Financial health metrics vs recommended ranges"
      guide={guide}
    >
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ratios.map((metric) => (
          <MetricGuideRow
            key={metric.label}
            label={metric.label}
            value={metric.value}
            ideal={metric.ideal}
            deviation={metric.deviation}
            status={metric.status}
          />
        ))}
        <MetricGuideRow
          label={pnl.label}
          value={pnl.value}
          ideal={pnl.ideal}
          deviation={pnl.deviation}
          status={pnl.status}
        />
      </dl>
    </DashboardWidgetCard>
  );
}
