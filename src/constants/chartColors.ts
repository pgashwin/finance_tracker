/** Material Design data-viz palette — seed #083c72, harmonious categorical sequence */
export const MD3 = {
  primary: '#083c72',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D4E4F5',
  onPrimaryContainer: '#001B3A',
  secondary: '#4A5D73',
  secondaryContainer: '#D2DEEA',
  tertiary: '#B8860B',
  tertiaryContainer: '#F5E6C8',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  success: '#2E6B4A',
  successContainer: '#B8E6CC',
  warning: '#C77700',
  warningContainer: '#FFE8C2',
  outline: '#6B7A8C',
  outlineVariant: '#C2CDD9',
  surface: '#F5F8FB',
  onSurface: '#0D1B2A',
  onSurfaceVariant: '#3D4F63',
} as const;

/** Ordered categorical colors for multi-series charts (MD: max ~6 distinguishable hues). */
export const CHART_CATEGORICAL = [
  MD3.primary,
  MD3.secondary,
  '#2E6B4A',
  '#0D7C8C',
  MD3.tertiary,
  '#5C6B7A',
  '#8B4A6B',
] as const;

export const BUCKET_COLORS: Record<string, string> = {
  Liquid: '#1565A8',
  'Fixed Deposits': '#4A5D73',
  Equity: '#2E6B4A',
  Crypto: '#0D7C8C',
  'PPF / PF': '#B8860B',
  Debt: MD3.error,
};

export const ALLOCATION_COLORS: Record<string, string> = {
  Liquid: BUCKET_COLORS.Liquid!,
  'Fixed Deposits': BUCKET_COLORS['Fixed Deposits']!,
  Equity: BUCKET_COLORS.Equity!,
  Crypto: BUCKET_COLORS.Crypto!,
  'PPF / PF': BUCKET_COLORS['PPF / PF']!,
  Other: MD3.outline,
};

export const ASSET_CATEGORY_COLORS = {
  real_estate: '#4A5D73',
  vehicle: '#083c72',
  gold: '#B8860B',
  jewelry: '#8B4A6B',
  other: '#6B7A8C',
} as const;

export const CASH_FLOW_COLORS = {
  income: MD3.success,
  expenses: MD3.error,
  surplus: MD3.primary,
  sip: '#4A5D73',
} as const;

export const SPEND_CATEGORY_COLORS = [
  MD3.error,
  MD3.warning,
  MD3.tertiary,
  MD3.success,
  '#0D7C8C',
  '#4A5D73',
  MD3.outline,
] as const;

export const CHART_NEUTRAL = MD3.outlineVariant;
export const CHART_NEGATIVE = MD3.error;
export const CHART_POSITIVE = MD3.success;
