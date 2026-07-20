import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
  chartMarginRotatedLabels,
  chartTickSmall,
  MaterialChartTooltip,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { InvestmentComparisonRow } from '@/services/analytics/portfolioAnalytics';
import { CHART_NEGATIVE } from '@/constants/chartColors';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPercent } from '@/utils/currency';

interface Props {
  data: InvestmentComparisonRow[];
  guide?: WidgetGuideContent;
}

export function InvestmentComparisonChart({ data, guide }: Props) {
  const { formatCompact } = useCurrency();

  if (!data.length) {
    return (
      <DashboardWidgetCard title="Investment Type Comparison" guide={guide}>
        <p className="text-sm text-muted-foreground">
          Add investments with cost basis to compare returns across types.
        </p>
      </DashboardWidgetCard>
    );
  }

  const chartData = data.map((d) => ({
    type: d.type,
    roi: d.roiPercent ?? 0,
    pnl: d.pnl,
    color: d.color,
    isRate: d.type.includes('rate'),
  }));

  const best = data[0];

  return (
    <DashboardWidgetCard
      title="Investment Type Comparison"
      subtitle={
        best ? (
          <>
            Top performer: <strong className="text-foreground">{best.type}</strong>
            {best.roiPercent != null &&
              ` (${formatPercent(best.roiPercent)}${best.type.includes('rate') ? ' p.a.' : ''})`}
          </>
        ) : undefined
      }
      guide={guide}
    >
      <ChartPlot height={272}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={chartMarginRotatedLabels} barCategoryGap="20%">
            <CartesianGrid {...chartGridProps} />
            <XAxis
              dataKey="type"
              {...chartAxisProps}
              tick={chartTickSmall}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={52}
            />
            <YAxis
              {...chartAxisProps}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              width={44}
              label={{
                value: 'Return %',
                angle: -90,
                position: 'insideLeft',
                style: { fill: chartTickSmall.fill, fontSize: 11, fontFamily: 'Roboto' },
              }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(212 40% 96% / 0.5)' }}
              content={
                <MaterialChartTooltip
                  formatter={(v: number, _n, props) => {
                    const row = props.payload as { isRate?: boolean };
                    if (row.isRate) return [`${v.toFixed(2)}% p.a.`, 'Interest rate'];
                    return [`${v.toFixed(2)}%`, 'ROI'];
                  }}
                />
              }
            />
            <Bar dataKey="roi" name="Return %" radius={chartBarRadius} barSize={chartBarSize} maxBarSize={40}>
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={entry.roi >= 0 ? entry.color : CHART_NEGATIVE} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPlot>
      <ChartDataTable>
        <ChartTableHead>
          <ChartTableTh>Type</ChartTableTh>
          <ChartTableTh>Invested</ChartTableTh>
          <ChartTableTh>P&L</ChartTableTh>
          <ChartTableTh>Return</ChartTableTh>
        </ChartTableHead>
        <ChartTableBody>
          {data.map((row) => (
            <ChartTableRow key={row.type}>
              <ChartTableTd>{row.type}</ChartTableTd>
              <ChartTableTd>{formatCompact(row.invested)}</ChartTableTd>
              <ChartTableTd className={row.pnl >= 0 ? 'text-success' : 'text-destructive'}>
                {formatCompact(row.pnl)}
              </ChartTableTd>
              <ChartTableTd>
                {row.roiPercent != null
                  ? `${formatPercent(row.roiPercent)}${row.type.includes('rate') ? ' p.a.' : ''}`
                  : '—'}
              </ChartTableTd>
            </ChartTableRow>
          ))}
        </ChartTableBody>
      </ChartDataTable>
    </DashboardWidgetCard>
  );
}
