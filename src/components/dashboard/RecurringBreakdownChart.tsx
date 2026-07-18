import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
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
      <Card>
        <CardHeader>
          <CardTitle>Monthly Recurring</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add recurring expenses to see breakdown.</p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Recurring</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" tickFormatter={(v) => format(v)} />
            <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => format(v)} />
            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
