import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
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
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add holdings, crypto, or assets with cost basis to see P&L.
          </p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Profit & Loss Analysis</CardTitle>
        <p
          className={`text-sm font-medium ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}
        >
          Total unrealized P&L: {formatCompact(totalPnl)}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => formatCompact(v)} width={72} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number, name: string) => [
                formatCompact(v),
                name === 'invested' ? 'Invested' : 'Current value',
              ]}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ''
              }
            />
            <Legend />
            <Bar dataKey="invested" name="Invested" fill={CHART_NEUTRAL} radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" name="Current value" fill={MD3.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-2">Category</th>
                <th className="p-2">P&L</th>
                <th className="p-2">Return</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.name} className="border-b">
                  <td className="p-2">{row.name}</td>
                  <td className={`p-2 font-medium ${row.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCompact(row.pnl)}
                  </td>
                  <td className="p-2">
                    {row.pnlPercent != null ? formatPercent(row.pnlPercent) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {guide && <WidgetGuide guide={guide} />}
      </CardContent>
    </Card>
  );
}
