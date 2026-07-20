import type { ReactNode } from 'react';
import type { TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

/** Material data-viz tokens — https://m2.material.io/design/communication/data-visualization.html#style */
export const CHART_OUTLINE = 'hsl(212 20% 84%)';
export const CHART_TICK_COLOR = 'hsl(212 14% 40%)';
export const CHART_PRIMARY_LINE = 'hsl(212 87% 24%)';

export const chartTick = { fill: CHART_TICK_COLOR, fontSize: 12, fontFamily: 'Roboto, sans-serif' };
export const chartTickSmall = { ...chartTick, fontSize: 11 };

export const chartAxisProps = {
  axisLine: { stroke: CHART_OUTLINE },
  tickLine: false as const,
  tick: chartTick,
};

export const chartGridProps = {
  stroke: CHART_OUTLINE,
  strokeDasharray: '4 6',
  vertical: false,
};

export const chartMargin = { top: 12, right: 16, left: 4, bottom: 0 };
export const chartMarginRotatedLabels = { top: 12, right: 16, left: 4, bottom: 8 };

export const chartBarRadius: [number, number, number, number] = [6, 6, 0, 0];
export const chartBarSize = 28;

export const chartLegendProps = {
  iconType: 'circle' as const,
  iconSize: 8,
  wrapperStyle: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 12,
    color: CHART_TICK_COLOR,
    paddingTop: 8,
  },
};

export const pieProps = {
  innerRadius: 52,
  outerRadius: 88,
  paddingAngle: 2,
  stroke: 'hsl(0 0% 100%)',
  strokeWidth: 2,
};

export const lineProps = {
  type: 'monotone' as const,
  strokeWidth: 2.5,
  dot: { r: 3, fill: CHART_PRIMARY_LINE, strokeWidth: 0 },
  activeDot: { r: 5, fill: CHART_PRIMARY_LINE, stroke: 'hsl(0 0% 100%)', strokeWidth: 2 },
};

interface ChartPlotProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

export function ChartPlot({ children, height = 268, className }: ChartPlotProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-outline-variant/30 bg-surface-container-low/70 p-3 sm:p-4',
        className,
      )}
    >
      <div style={{ width: '100%', height }}>{children}</div>
    </div>
  );
}

export function MaterialChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter && label != null ? labelFormatter(label, payload) : label;

  return (
    <div className="rounded-xl border border-outline-variant/50 bg-card px-3 py-2.5 text-xs shadow-sm md-elevation-2">
      {displayLabel && (
        <p className="mb-1.5 font-medium text-foreground">{String(displayLabel)}</p>
      )}
      <ul className="space-y-1">
        {payload.map((entry) => {
          const raw = entry.value as number;
          const name = String(entry.name ?? entry.dataKey ?? '');
          const value = formatter
            ? formatter(raw, name, entry, 0, payload)
            : [raw, name];
          const displayValue = Array.isArray(value) ? value[0] : value;
          const displayName = Array.isArray(value) ? value[1] : name;

          return (
            <li key={name} className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {displayName}:{' '}
                <span className="font-medium text-foreground">{String(displayValue)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ChartDataTableProps {
  children: ReactNode;
  className?: string;
}

export function ChartDataTable({ children, className }: ChartDataTableProps) {
  return (
    <div
      className={cn(
        'mt-4 overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest/80',
        className,
      )}
    >
      <table className="w-full text-xs">{children}</table>
    </div>
  );
}

export function ChartTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-outline-variant/40 bg-surface-container-low text-left text-muted-foreground">
        {children}
      </tr>
    </thead>
  );
}

export function ChartTableTh({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn('px-3 py-2.5 font-medium', className)}>{children}</th>;
}

export function ChartTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-outline-variant/30">{children}</tbody>;
}

export function ChartTableRow({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-surface-container-low/80">{children}</tr>;
}

export function ChartTableTd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn('px-3 py-2.5', className)}>{children}</td>;
}
