import type { DeviationStatus } from '@/content/dashboardGuides';

/**
 * M3 dynamic surface roles derived from the app seed (#083c72).
 * Maps metric health → container / on-container pairs (see M3 dynamic color).
 * https://m3.material.io/styles/color/dynamic/choosing-a-source
 */
export interface DynamicCardTheme {
  card: string;
  iconChip: string;
  value: string;
  border: string;
}

const THEMES: Record<DeviationStatus, DynamicCardTheme> = {
  good: {
    card: 'bg-success-container/80',
    iconChip: 'bg-success text-success-foreground',
    value: 'text-success-container-foreground',
    border: 'border-success/25',
  },
  warn: {
    card: 'bg-warning-container/90',
    iconChip: 'bg-warning text-warning-foreground',
    value: 'text-warning-container-foreground',
    border: 'border-warning/30',
  },
  bad: {
    card: 'bg-destructive-container/90',
    iconChip: 'bg-destructive text-destructive-foreground',
    value: 'text-destructive-container-foreground',
    border: 'border-destructive/25',
  },
  neutral: {
    card: 'bg-secondary-container/70',
    iconChip: 'bg-secondary text-secondary-foreground',
    value: 'text-secondary-container-foreground',
    border: 'border-secondary/20',
  },
  na: {
    card: 'bg-surface-container',
    iconChip: 'bg-outline/20 text-muted-foreground',
    value: 'text-foreground',
    border: 'border-outline-variant/50',
  },
};

function trendFallback(trend?: 'positive' | 'negative' | 'neutral'): DeviationStatus {
  if (trend === 'positive') return 'good';
  if (trend === 'negative') return 'bad';
  return 'neutral';
}

export function dynamicCardTheme(
  status?: DeviationStatus,
  trend?: 'positive' | 'negative' | 'neutral',
): DynamicCardTheme {
  return THEMES[status ?? trendFallback(trend)];
}
