import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartPlot,
  chartAxisProps,
  chartBarRadius,
  chartBarSize,
  chartGridProps,
  chartMargin,
  MaterialChartTooltip,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import { CASH_FLOW_COLORS } from '@/constants/chartColors';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  income: number | null;
  expenses: number;
  surplus: number | null;
  investmentSip: number;
  guide?: WidgetGuideContent;
}

export function CashFlowChart({ income, expenses, surplus, investmentSip, guide }: Props) {
  const { formatCompact } = useCurrency();

  if (income == null) {
    return (
      <DashboardWidgetCard title="Monthly Cash Flow" guide={guide}>
        <p className="text-sm text-muted-foreground">
          Set monthly income in Settings to see income vs expenses breakdown.
        </p>
        <p className="mt-2 text-sm">
          Current monthly outflow: <strong className="text-foreground">{formatCompact(expenses)}</strong>
        </p>
      </DashboardWidgetCard>
    );
  }

  const chartData = [
    { name: 'Income', value: income, color: CASH_FLOW_COLORS.income },
    { name: 'Expenses', value: expenses, color: CASH_FLOW_COLORS.expenses },
    { name: 'Surplus', value: Math.max(0, surplus ?? 0), color: CASH_FLOW_COLORS.surplus },
    { name: 'SIP / Invest', value: investmentSip, color: CASH_FLOW_COLORS.sip },
  ].filter((d) => d.value > 0);

  return (
    <DashboardWidgetCard
      title="Monthly Cash Flow"
      subtitle={
        <>
          Surplus after recurring expenses:{' '}
          <strong className={(surplus ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
            {formatCompact(surplus ?? 0)}
          </strong>
        </>
      }
      guide={guide}
    >
      <ChartPlot height={248}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={chartMargin} barCategoryGap="22%">
            <CartesianGrid {...chartGridProps} />
            <XAxis dataKey="name" {...chartAxisProps} />
            <YAxis {...chartAxisProps} tickFormatter={(v) => formatCompact(v)} width={68} />
            <Tooltip
              cursor={{ fill: 'hsl(212 40% 96% / 0.5)' }}
              content={
                <MaterialChartTooltip formatter={(v: number, name: string) => [formatCompact(v), name]} />
              }
            />
            <Bar dataKey="value" name="Amount" radius={chartBarRadius} barSize={chartBarSize} maxBarSize={48}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPlot>
    </DashboardWidgetCard>
  );
}
