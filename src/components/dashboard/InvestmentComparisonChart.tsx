import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetGuide } from '@/components/dashboard/WidgetGuide';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { InvestmentComparisonRow } from '@/services/analytics/portfolioAnalytics';
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
      <Card>
        <CardHeader>
          <CardTitle>Investment Type Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add investments with cost basis to compare returns across types.
          </p>
          {guide && <WidgetGuide guide={guide} />}
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Investment Type Comparison</CardTitle>
        {best && (
          <p className="text-sm text-muted-foreground">
            Top performer: <strong>{best.type}</strong>
            {best.roiPercent != null && ` (${formatPercent(best.roiPercent)}${best.type.includes('rate') ? ' p.a.' : ''})`}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="type" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={56} />
            <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} width={48} />
            <Tooltip
              formatter={(v: number, _n, props) => {
                const row = props.payload;
                if (row.isRate) return [`${v.toFixed(2)}% p.a.`, 'Interest rate'];
                return [`${v.toFixed(2)}%`, 'ROI'];
              }}
            />
            <Bar dataKey="roi" name="Return %" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.type}
                  fill={entry.roi >= 0 ? entry.color : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-2">Type</th>
                <th className="p-2">Invested</th>
                <th className="p-2">P&L</th>
                <th className="p-2">Return</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.type} className="border-b">
                  <td className="p-2">{row.type}</td>
                  <td className="p-2">{formatCompact(row.invested)}</td>
                  <td className={`p-2 ${row.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCompact(row.pnl)}
                  </td>
                  <td className="p-2">
                    {row.roiPercent != null
                      ? `${formatPercent(row.roiPercent)}${row.type.includes('rate') ? ' p.a.' : ''}`
                      : '—'}
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
