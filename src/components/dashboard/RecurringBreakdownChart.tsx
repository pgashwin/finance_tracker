import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartPlot,
  chartAxisProps,
  chartBarRadius,
  chartGridProps,
  chartMargin,
  chartTickSmall,
  CHART_PRIMARY_LINE,
  MaterialChartTooltip,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { RecurringBreakdown } from '@/services/analytics/netWorth';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  data: RecurringBreakdown[];
  guide?: WidgetGuideContent;
}

export function RecurringBreakdownChart({ data, guide }: Props) {
  const { format } = useCurrency();
  const chartData = data.map((d) => ({
    category: d.category.replace(/_/g, ' '),
    amount: d.amount,
  }));

  if (!chartData.length) {
    return (
      <DashboardWidgetCard title="Monthly Recurring" guide={guide}>
        <p className="text-sm text-muted-foreground">Add recurring expenses to see breakdown.</p>
      </DashboardWidgetCard>
    );
  }

  return (
    <DashboardWidgetCard title="Monthly Recurring" guide={guide}>
      <ChartPlot height={268}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ ...chartMargin, left: 4, right: 16 }}>
            <CartesianGrid {...chartGridProps} horizontal={false} vertical />
            <XAxis type="number" {...chartAxisProps} tickFormatter={(v) => format(v)} />
            <YAxis
              type="category"
              dataKey="category"
              {...chartAxisProps}
              tick={chartTickSmall}
              width={104}
            />
            <Tooltip
              cursor={{ fill: 'hsl(212 40% 96% / 0.45)' }}
              content={
                <MaterialChartTooltip formatter={(v: number) => [format(v), 'Monthly']} />
              }
            />
            <Bar
              dataKey="amount"
              name="Monthly"
              fill={CHART_PRIMARY_LINE}
              radius={chartBarRadius}
              barSize={20}
              maxBarSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartPlot>
    </DashboardWidgetCard>
  );
}
