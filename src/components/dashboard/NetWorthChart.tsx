import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
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
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Record monthly snapshots to see your net worth trend.
          </p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
    );
  }

  const data = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12 }} width={70} />
            <Tooltip formatter={(v: number) => formatCompact(v)} />
            <Line type="monotone" dataKey="netWorth" stroke="hsl(var(--primary))" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
