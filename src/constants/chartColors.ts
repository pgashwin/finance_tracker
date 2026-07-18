/** Material Design 3 color tokens for charts and data visualization. */
export const MD3 = {
  primary: '#0061A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1E4FF',
  secondary: '#535F70',
  secondaryContainer: '#D7E3F7',
  tertiary: '#6B5778',
  tertiaryContainer: '#F2DAFF',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  success: '#2E7D32',
  successContainer: '#C8E6C9',
  warning: '#EF6C00',
  warningContainer: '#FFE0B2',
  outline: '#73777F',
  outlineVariant: '#C3C7CF',
  surface: '#F8F9FF',
  onSurface: '#191C20',
  onSurfaceVariant: '#43474E',
} as const;

export const BUCKET_COLORS: Record<string, string> = {
  Liquid: '#1976D2',
  'Fixed Deposits': '#7B1FA2',
  Equity: '#388E3C',
  Crypto: '#00838F',
  'PPF / PF': '#EF6C00',
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
  real_estate: '#5D4037',
  vehicle: '#3949AB',
  gold: '#F9A825',
  jewelry: '#AD1457',
  other: '#546E7A',
} as const;

export const CASH_FLOW_COLORS = {
  income: MD3.success,
  expenses: MD3.error,
  surplus: MD3.primary,
  sip: '#7B1FA2',
} as const;

export const SPEND_CATEGORY_COLORS = [
  MD3.error,
  MD3.warning,
  '#F9A825',
  MD3.success,
  '#00838F',
  '#7B1FA2',
  MD3.outline,
] as const;

export const CHART_NEUTRAL = MD3.outline;
export const CHART_NEGATIVE = MD3.error;
