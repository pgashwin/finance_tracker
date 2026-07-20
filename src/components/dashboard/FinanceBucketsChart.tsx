import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartPlot,
  chartAxisProps,
  chartBarRadius,
  chartGridProps,
  chartMargin,
  chartTickSmall,
  MaterialChartTooltip,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { FinanceBucketRow } from '@/services/analytics/portfolioAnalytics';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPercent } from '@/utils/currency';

interface Props {
  data: FinanceBucketRow[];
  guide?: WidgetGuideContent;
}

export function FinanceBucketsChart({ data, guide }: Props) {
  const { formatCompact } = useCurrency();

  if (!data.length) {
    return (
      <DashboardWidgetCard title="Finance Buckets" guide={guide}>
        <p className="text-sm text-muted-foreground">Add financial data to see bucket summary.</p>
      </DashboardWidgetCard>
    );
  }

  const chartData = data.map((d) => ({
    bucket: d.bucket,
    value: d.currentValue,
    percent: d.percentOfAssets,
    color: d.color,
  }));

  return (
    <DashboardWidgetCard
      title="Finance Buckets"
      subtitle="Where your money lives across asset classes"
      guide={guide}
    >
      <ChartPlot height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ ...chartMargin, left: 8, right: 20 }}>
            <CartesianGrid {...chartGridProps} horizontal={false} vertical />
            <XAxis
              type="number"
              {...chartAxisProps}
              tickFormatter={(v) => formatCompact(v)}
            />
            <YAxis
              type="category"
              dataKey="bucket"
              {...chartAxisProps}
              tick={chartTickSmall}
              width={108}
            />
            <Tooltip
              cursor={{ fill: 'hsl(212 40% 96% / 0.45)' }}
              content={
                <MaterialChartTooltip
                  formatter={(v: number, _n, props) => [
                    `${formatCompact(v)} (${formatPercent(props.payload.percent)})`,
                    'Value',
                  ]}
                  labelFormatter={(label) => String(label)}
                />
              }
            />
            <Bar dataKey="value" name="Current value" radius={chartBarRadius} barSize={22} maxBarSize={28}>
              {chartData.map((entry) => (
                <Cell key={entry.bucket} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPlot>
    </DashboardWidgetCard>
  );
}
