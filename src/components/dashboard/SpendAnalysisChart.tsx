import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { SpendAnalysis } from '@/services/analytics/portfolioAnalytics';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPercent } from '@/utils/currency';

interface Props {
  analysis: SpendAnalysis;
  guide?: WidgetGuideContent;
}

const SPEND_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#8b5cf6', '#64748b'];

export function SpendAnalysisChart({ analysis, guide }: Props) {
  const { formatCompact } = useCurrency();
  const { categories, totalMonthly, fixedMonthly, discretionaryMonthly, investmentMonthly, savingsRate, surplusMonthly, incomeMonthly } = analysis;

  if (totalMonthly === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add recurring expenses to analyze spending.</p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
    );
  }

  const categoryData = categories.map((c, i) => ({
    name: c.label,
    value: c.monthly,
    color: SPEND_COLORS[i % SPEND_COLORS.length]!,
  }));

  const natureData = [
    { name: 'Fixed (EMI, rent, etc.)', value: fixedMonthly, color: '#ef4444' },
    { name: 'Discretionary', value: discretionaryMonthly, color: '#f97316' },
    { name: 'Investments (SIP)', value: investmentMonthly, color: '#10b981' },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend Analysis</CardTitle>
        <div className="flex flex-wrap gap-3 text-sm">
          <span>Monthly: <strong>{formatCompact(totalMonthly)}</strong></span>
          <span>Annual: <strong>{formatCompact(analysis.totalAnnual)}</strong></span>
          {savingsRate != null && (
            <span className={savingsRate >= 20 ? 'text-green-600' : 'text-amber-600'}>
              Savings rate: <strong>{formatPercent(savingsRate)}</strong>
            </span>
          )}
          {surplusMonthly != null && incomeMonthly != null && (
            <span>Surplus: <strong>{formatCompact(surplusMonthly)}/mo</strong></span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">By category (monthly)</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCompact(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Fixed vs discretionary</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={natureData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {natureData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCompact(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {!incomeMonthly && (
          <p className="mt-3 text-xs text-muted-foreground">
            Set monthly income in Settings to see savings rate and surplus.
          </p>
        )}
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
