import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
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
      <Card>
        <CardHeader>
          <CardTitle>Finance Buckets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add financial data to see bucket summary.</p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    bucket: d.bucket,
    value: d.currentValue,
    percent: d.percentOfAssets,
    color: d.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Buckets</CardTitle>
        <p className="text-sm text-muted-foreground">Where your money lives across asset classes</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" tickFormatter={(v) => formatCompact(v)} />
            <YAxis type="category" dataKey="bucket" width={110} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number, _n, props) => [
                `${formatCompact(v)} (${formatPercent(props.payload.percent)})`,
                'Value',
              ]}
            />
            <Bar dataKey="value" name="Current value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.bucket} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
