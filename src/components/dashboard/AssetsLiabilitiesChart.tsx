import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartPlot,
  chartAxisProps,
  chartBarRadius,
  chartBarSize,
  chartGridProps,
  chartLegendProps,
  chartMargin,
  MaterialChartTooltip,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import { MD3 } from '@/constants/chartColors';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  assets: number;
  liabilities: number;
  netWorth: number;
  guide?: WidgetGuideContent;
}

export function AssetsLiabilitiesChart({ assets, liabilities, netWorth, guide }: Props) {
  const { formatCompact } = useCurrency();

  if (assets === 0 && liabilities === 0) {
    return (
      <DashboardWidgetCard title="Assets vs Liabilities" guide={guide}>
        <p className="text-sm text-muted-foreground">No assets or debt recorded yet.</p>
      </DashboardWidgetCard>
    );
  }

  const chartData = [{ name: 'Portfolio', assets, liabilities, netWorth }];

  return (
    <DashboardWidgetCard
      title="Assets vs Liabilities"
      subtitle={`Net worth: ${formatCompact(netWorth)}`}
      subtitleClassName={netWorth >= 0 ? 'font-medium text-success' : 'font-medium text-destructive'}
      guide={guide}
    >
      <ChartPlot height={248}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={chartMargin} barGap={8}>
            <CartesianGrid {...chartGridProps} />
            <XAxis dataKey="name" {...chartAxisProps} />
            <YAxis {...chartAxisProps} tickFormatter={(v) => formatCompact(v)} width={68} />
            <Tooltip
              cursor={{ fill: 'hsl(212 40% 96% / 0.5)' }}
              content={
                <MaterialChartTooltip
                  formatter={(v: number, name: string) => [
                    formatCompact(v),
                    name === 'assets' ? 'Total assets' : 'Total debt',
                  ]}
                />
              }
            />
            <Legend {...chartLegendProps} />
            <Bar
              dataKey="assets"
              name="Total assets"
              fill={MD3.success}
              radius={chartBarRadius}
              barSize={chartBarSize}
            />
            <Bar
              dataKey="liabilities"
              name="Total debt"
              fill={MD3.error}
              radius={chartBarRadius}
              barSize={chartBarSize}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartPlot>
    </DashboardWidgetCard>
  );
}
