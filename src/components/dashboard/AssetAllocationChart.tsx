import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
  ChartPlot,
  chartLegendProps,
  MaterialChartTooltip,
  pieProps,
} from '@/components/dashboard/chartTheme';
import type { WidgetGuideContent } from '@/content/dashboardGuides';
import type { AllocationSlice } from '@/services/analytics/netWorth';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPercent } from '@/utils/currency';

interface Props {
  data: AllocationSlice[];
  guide?: WidgetGuideContent;
}

export function AssetAllocationChart({ data, guide }: Props) {
  const { formatCompact } = useCurrency();
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length) {
    return (
      <DashboardWidgetCard title="Asset Allocation" guide={guide}>
        <p className="text-sm text-muted-foreground">Add assets to see allocation.</p>
      </DashboardWidgetCard>
    );
  }

  return (
    <DashboardWidgetCard title="Asset Allocation" guide={guide}>
      <ChartPlot height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="46%"
              innerRadius={pieProps.innerRadius}
              outerRadius={pieProps.outerRadius}
              paddingAngle={pieProps.paddingAngle}
              stroke={pieProps.stroke}
              strokeWidth={pieProps.strokeWidth}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={
                <MaterialChartTooltip
                  formatter={(v: number, name: string) => [
                    `${formatCompact(v)} (${formatPercent(total > 0 ? (v / total) * 100 : 0)})`,
                    name,
                  ]}
                />
              }
            />
            <Legend {...chartLegendProps} verticalAlign="bottom" layout="horizontal" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </ChartPlot>
    </DashboardWidgetCard>
  );
}
