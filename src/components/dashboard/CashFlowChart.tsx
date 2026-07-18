import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
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
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set monthly income in Settings to see income vs expenses breakdown.
          </p>
          <p className="mt-2 text-sm">
            Current monthly outflow: <strong>{formatCompact(expenses)}</strong>
          </p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Income', value: income, color: CASH_FLOW_COLORS.income },
    { name: 'Expenses', value: expenses, color: CASH_FLOW_COLORS.expenses },
    { name: 'Surplus', value: Math.max(0, surplus ?? 0), color: CASH_FLOW_COLORS.surplus },
    { name: 'SIP / Invest', value: investmentSip, color: CASH_FLOW_COLORS.sip },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cash Flow</CardTitle>
        <p className="text-sm text-muted-foreground">
          Surplus after recurring expenses:{' '}
          <strong className={(surplus ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
            {formatCompact(surplus ?? 0)}
          </strong>
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatCompact(v)} width={72} />
            <Tooltip formatter={(v: number) => formatCompact(v)} />
            <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
