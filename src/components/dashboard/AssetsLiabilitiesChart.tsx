import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
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
      <Card>
        <CardHeader>
          <CardTitle>Assets vs Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No assets or debt recorded yet.</p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Total', assets, liabilities, netWorth },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets vs Liabilities</CardTitle>
        <p className={`text-sm font-medium ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Net worth: {formatCompact(netWorth)}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => formatCompact(v)} width={72} />
            <Tooltip formatter={(v: number) => formatCompact(v)} />
            <Legend />
            <Bar dataKey="assets" name="Total assets" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="liabilities" name="Total debt" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
