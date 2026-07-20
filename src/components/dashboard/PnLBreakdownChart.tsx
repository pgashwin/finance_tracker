import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartDataTable,
  ChartPlot,
  ChartTableBody,
  ChartTableHead,
  ChartTableRow,
  ChartTableTd,
  ChartTableTh,
  chartAxisProps,
  chartBarRadius,
  chartBarSize,
  chartGridProps,
  chartLegendProps,
  chartMarginRotatedLabels,
  chartTickSmall,
  MaterialChartTooltip,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { PnLSlice } from '@/services/analytics/portfolioAnalytics';
import { CHART_NEUTRAL, MD3 } from '@/constants/chartColors';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPercent } from '@/utils/currency';

interface Props {
  data: PnLSlice[];
  totalPnl: number;
  guide?: WidgetGuideContent;
}

export function PnLBreakdownChart({ data, totalPnl, guide }: Props) {
  const { formatCompact } = useCurrency();

  if (!data.length) {
    return (
      <DashboardWidgetCard title="Profit & Loss Analysis" guide={guide}>
        <p className="text-sm text-muted-foreground">
          Add holdings, crypto, or assets with cost basis to see P&L.
        </p>
      </DashboardWidgetCard>
    );
  }

  const chartData = data.map((d) => ({
    name: d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name,
    fullName: d.name,
    invested: d.invested,
    current: d.current,
    pnl: d.pnl,
    pnlPercent: d.pnlPercent,
    color: d.color,
  }));

  return (
    <DashboardWidgetCard
      title="Profit & Loss Analysis"
      subtitle={
        <p className={`text-sm font-medium ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
          Total unrealized P&L: {formatCompact(totalPnl)}
        </p>
      }
      guide={guide}
    >
      <ChartPlot height={288}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={chartMarginRotatedLabels} barGap={4} barCategoryGap="18%">
            <CartesianGrid {...chartGridProps} />
            <XAxis
              dataKey="name"
              {...chartAxisProps}
              tick={chartTickSmall}
              interval={0}
              angle={-16}
              textAnchor="end"
              height={56}
            />
            <YAxis
              {...chartAxisProps}
              tickFormatter={(v) => formatCompact(v)}
              width={68}
              tick={chartTickSmall}
            />
            <Tooltip
              cursor={{ fill: 'hsl(212 40% 96% / 0.5)' }}
              content={
                <MaterialChartTooltip
                  formatter={(v: number, name: string) => [
                    formatCompact(v),
                    name === 'invested' ? 'Invested' : 'Current value',
                  ]}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ''
                  }
                />
              }
            />
            <Legend {...chartLegendProps} />
            <Bar
              dataKey="invested"
              name="Invested"
              fill={CHART_NEUTRAL}
              radius={chartBarRadius}
              barSize={chartBarSize}
            />
            <Bar
              dataKey="current"
              name="Current value"
              fill={MD3.primary}
              radius={chartBarRadius}
              barSize={chartBarSize}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartPlot>
      <ChartDataTable>
        <ChartTableHead>
          <ChartTableTh>Category</ChartTableTh>
          <ChartTableTh>P&L</ChartTableTh>
          <ChartTableTh>Return</ChartTableTh>
        </ChartTableHead>
        <ChartTableBody>
          {data.map((row) => (
            <ChartTableRow key={row.name}>
              <ChartTableTd>{row.name}</ChartTableTd>
              <ChartTableTd className={`font-medium ${row.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCompact(row.pnl)}
              </ChartTableTd>
              <ChartTableTd>{row.pnlPercent != null ? formatPercent(row.pnlPercent) : '—'}</ChartTableTd>
            </ChartTableRow>
          ))}
        </ChartTableBody>
      </ChartDataTable>
    </DashboardWidgetCard>
  );
}
