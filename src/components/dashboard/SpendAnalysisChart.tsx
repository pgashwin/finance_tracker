import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartPlot,
  chartLegendProps,
  MaterialChartTooltip,
  pieProps,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { SpendAnalysis } from '@/services/analytics/portfolioAnalytics';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPercent } from '@/utils/currency';
import { SPEND_CATEGORY_COLORS, MD3 } from '@/constants/chartColors';

interface Props {
  analysis: SpendAnalysis;
  guide?: WidgetGuideContent;
}

export function SpendAnalysisChart({ analysis, guide }: Props) {
  const { formatCompact } = useCurrency();
  const {
    categories,
    totalMonthly,
    fixedMonthly,
    discretionaryMonthly,
    investmentMonthly,
    savingsRate,
    surplusMonthly,
    incomeMonthly,
  } = analysis;

  if (totalMonthly === 0) {
    return (
      <DashboardWidgetCard title="Spend Analysis" guide={guide}>
        <p className="text-sm text-muted-foreground">Add recurring expenses to analyze spending.</p>
      </DashboardWidgetCard>
    );
  }

  const categoryData = categories.map((c, i) => ({
    name: c.label,
    value: c.monthly,
    color: SPEND_CATEGORY_COLORS[i % SPEND_CATEGORY_COLORS.length]!,
  }));

  const natureData = [
    { name: 'Fixed', value: fixedMonthly, color: MD3.error },
    { name: 'Discretionary', value: discretionaryMonthly, color: MD3.warning },
    { name: 'Investments', value: investmentMonthly, color: MD3.success },
  ].filter((d) => d.value > 0);

  const categoryTotal = categoryData.reduce((s, d) => s + d.value, 0);
  const natureTotal = natureData.reduce((s, d) => s + d.value, 0);

  return (
    <DashboardWidgetCard
      title="Spend Analysis"
      subtitle={
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span>
            Monthly: <strong className="text-foreground">{formatCompact(totalMonthly)}</strong>
          </span>
          <span>
            Annual: <strong className="text-foreground">{formatCompact(analysis.totalAnnual)}</strong>
          </span>
          {savingsRate != null && (
            <span className={savingsRate >= 20 ? 'text-success' : 'text-warning'}>
              Savings rate: <strong>{formatPercent(savingsRate)}</strong>
            </span>
          )}
          {surplusMonthly != null && incomeMonthly != null && (
            <span>
              Surplus: <strong className="text-foreground">{formatCompact(surplusMonthly)}/mo</strong>
            </span>
          )}
        </div>
      }
      guide={guide}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            By category
          </p>
          <ChartPlot height={236}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={44}
                  outerRadius={76}
                  paddingAngle={pieProps.paddingAngle}
                  stroke={pieProps.stroke}
                  strokeWidth={pieProps.strokeWidth}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <MaterialChartTooltip
                      formatter={(v: number, name: string) => [
                        `${formatCompact(v)} (${formatPercent(categoryTotal > 0 ? (v / categoryTotal) * 100 : 0)})`,
                        name,
                      ]}
                    />
                  }
                />
                <Legend {...chartLegendProps} wrapperStyle={{ ...chartLegendProps.wrapperStyle, fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPlot>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fixed vs discretionary
          </p>
          <ChartPlot height={236}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={natureData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={44}
                  outerRadius={76}
                  paddingAngle={pieProps.paddingAngle}
                  stroke={pieProps.stroke}
                  strokeWidth={pieProps.strokeWidth}
                >
                  {natureData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <MaterialChartTooltip
                      formatter={(v: number, name: string) => [
                        `${formatCompact(v)} (${formatPercent(natureTotal > 0 ? (v / natureTotal) * 100 : 0)})`,
                        name,
                      ]}
                    />
                  }
                />
                <Legend {...chartLegendProps} wrapperStyle={{ ...chartLegendProps.wrapperStyle, fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPlot>
        </div>
      </div>
      {!incomeMonthly && (
        <p className="mt-3 text-xs text-muted-foreground">
          Set monthly income in Settings to see savings rate and surplus.
        </p>
      )}
    </DashboardWidgetCard>
  );
}
