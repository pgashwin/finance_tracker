import { useId } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartPlot,
  chartAxisProps,
  chartGridProps,
  chartMargin,
  CHART_PRIMARY_LINE,
  lineProps,
  MaterialChartTooltip,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { MonthlySnapshot } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  snapshots: MonthlySnapshot[];
  guide?: WidgetGuideContent;
}

export function NetWorthChart({ snapshots, guide }: Props) {
  const { formatCompact } = useCurrency();

  if (snapshots.length < 2) {
    return (
      <DashboardWidgetCard title="Net Worth Trend" guide={guide}>
        <p className="text-sm text-muted-foreground">
          Record monthly snapshots to see your net worth trend.
        </p>
      </DashboardWidgetCard>
    );
  }

  const data = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
  const gradientId = useId().replace(/:/g, '');

  return (
    <DashboardWidgetCard title="Net Worth Trend" guide={guide}>
      <ChartPlot height={268}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargin}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_PRIMARY_LINE} stopOpacity={0.18} />
                <stop offset="100%" stopColor={CHART_PRIMARY_LINE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGridProps} />
            <XAxis dataKey="month" {...chartAxisProps} />
            <YAxis
              {...chartAxisProps}
              tickFormatter={(v) => formatCompact(v)}
              width={68}
            />
            <Tooltip
              content={<MaterialChartTooltip formatter={(v: number) => [formatCompact(v), 'Net worth']} />}
            />
            <Area
              type={lineProps.type}
              dataKey="netWorth"
              stroke="none"
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
            <Line
              dataKey="netWorth"
              name="Net worth"
              stroke={CHART_PRIMARY_LINE}
              strokeWidth={lineProps.strokeWidth}
              type={lineProps.type}
              dot={lineProps.dot}
              activeDot={lineProps.activeDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartPlot>
    </DashboardWidgetCard>
  );
}
