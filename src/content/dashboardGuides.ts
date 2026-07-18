import type { FinanceState } from '@/types';
import { formatCompactForState, formatPercent } from '@/utils/currency';
import {
  debtToAssetRatio,
  emiBurdenPercent,
  emergencyFundMonths,
  insuranceCoverageRatio,
  liquidityRatio,
  monthlyOutflow,
  netWorth,
  totalAssetsValue,
  totalLiabilities,
  totalLiquidAssets,
  unrealizedPnL,
} from '@/services/analytics/netWorth';
import { spendAnalysis, totalPnLSummary } from '@/services/analytics/portfolioAnalytics';

export type DeviationStatus = 'good' | 'warn' | 'bad' | 'neutral' | 'na';

export interface WidgetGuideContent {
  summary: string;
  formula: string;
  ideal: string;
}

export interface MetricAssessment {
  label: string;
  value: string;
  ideal: string;
  deviation: string;
  status: DeviationStatus;
}

function statusFromRange(
  value: number,
  good: { min?: number; max?: number },
  warn?: { min?: number; max?: number },
  higherIsBetter = true,
): DeviationStatus {
  if (!Number.isFinite(value)) return 'na';
  const inGood =
    (good.min === undefined || value >= good.min) && (good.max === undefined || value <= good.max);
  if (inGood) return 'good';

  if (warn) {
    const inWarn =
      (warn.min === undefined || value >= warn.min) && (warn.max === undefined || value <= warn.max);
    if (inWarn) return 'warn';
  }

  return higherIsBetter
    ? value < (good.min ?? -Infinity)
      ? 'bad'
      : 'warn'
    : value > (good.max ?? Infinity)
      ? 'bad'
      : 'warn';
}

export function assessLiquidityRatio(ratio: number): MetricAssessment {
  const status = statusFromRange(ratio, { min: 10, max: 25 }, { min: 5, max: 40 });
  return {
    label: 'Liquidity ratio',
    value: formatPercent(ratio),
    ideal: '10–25% of total assets in liquid form',
    deviation:
      status === 'good'
        ? 'Within healthy range'
        : ratio < 10
          ? `Below ideal by ${formatPercent(10 - ratio)}`
          : `Above typical range by ${formatPercent(ratio - 25)}`,
    status,
  };
}

export function assessEmergencyMonths(months: number | null): MetricAssessment {
  if (months === null) {
    return {
      label: 'Emergency fund',
      value: '—',
      ideal: '6 months of expenses in flagged emergency liquid funds',
      deviation: 'Add recurring expenses and emergency-flagged liquid funds',
      status: 'na',
    };
  }
  const status = statusFromRange(months, { min: 6 }, { min: 3, max: 5.9 });
  return {
    label: 'Emergency fund',
    value: `${months.toFixed(1)} months`,
    ideal: '≥ 6 months of monthly outflow',
    deviation:
      status === 'good'
        ? 'Meets 6-month guideline'
        : months < 3
          ? `${(3 - months).toFixed(1)} months below minimum safety buffer`
          : `${(6 - months).toFixed(1)} months below ideal target`,
    status,
  };
}

export function assessEmiBurden(pct: number | null): MetricAssessment {
  if (pct === null) {
    return {
      label: 'EMI burden',
      value: '—',
      ideal: '≤ 40% of net monthly income',
      deviation: 'Set monthly income in Settings',
      status: 'na',
    };
  }
  const status = statusFromRange(pct, { max: 40 }, { max: 50 }, false);
  return {
    label: 'EMI burden',
    value: formatPercent(pct),
    ideal: '≤ 40% (comfortable ≤ 25%)',
    deviation:
      status === 'good'
        ? pct <= 25
          ? 'Comfortable EMI load'
          : 'Within acceptable limit'
        : `${formatPercent(pct - 40)} above recommended maximum`,
    status,
  };
}

export function assessDebtToAsset(ratio: number): MetricAssessment {
  const status = statusFromRange(ratio, { max: 30 }, { max: 50 }, false);
  return {
    label: 'Debt-to-asset ratio',
    value: formatPercent(ratio),
    ideal: '≤ 30% for low leverage; ≤ 50% acceptable',
    deviation:
      status === 'good'
        ? 'Leverage is moderate'
        : `${formatPercent(ratio - 30)} above low-leverage target`,
    status: ratio === 0 ? 'good' : status,
  };
}

export function assessInsuranceCoverage(ratio: number | null): MetricAssessment {
  if (ratio === null) {
    return {
      label: 'Term insurance cover',
      value: '—',
      ideal: '10× annual income (minimum 5×)',
      deviation: 'Add term policies and monthly income',
      status: 'na',
    };
  }
  const status = statusFromRange(ratio, { min: 10 }, { min: 5, max: 9.9 });
  return {
    label: 'Term insurance cover',
    value: `${ratio.toFixed(1)}× income`,
    ideal: '10× annual income',
    deviation:
      status === 'good'
        ? 'Adequate term cover'
        : `${(10 - ratio).toFixed(1)}× below ideal (10× rule of thumb)`,
    status,
  };
}

export function assessSavingsRate(rate: number | null): MetricAssessment {
  if (rate === null) {
    return {
      label: 'Savings rate',
      value: '—',
      ideal: '≥ 20% of net monthly income',
      deviation: 'Set monthly income in Settings',
      status: 'na',
    };
  }
  const status = statusFromRange(rate, { min: 20 }, { min: 10, max: 19.9 });
  return {
    label: 'Savings rate',
    value: formatPercent(rate),
    ideal: '≥ 20% after recurring outflows',
    deviation:
      status === 'good'
        ? 'Strong savings buffer'
        : `${formatPercent(20 - rate)} below 20% target`,
    status,
  };
}

export function assessNetWorth(value: number, state: FinanceState): MetricAssessment {
  return {
    label: 'Net worth',
    value: formatCompactForState(value, state),
    ideal: 'Positive and growing over time',
    deviation:
      value >= 0
        ? 'Assets exceed liabilities'
        : `Liabilities exceed assets by ${formatCompactForState(Math.abs(value), state)}`,
    status: value >= 0 ? 'good' : 'bad',
  };
}

export const WIDGET_GUIDES = {
  netWorth: {
    summary: 'Your total wealth after subtracting all outstanding loans.',
    formula: 'Total assets (liquid + FD + equity + crypto + PPF/PF + physical assets) − total loan outstanding',
    ideal: 'Positive net worth that increases when you record monthly snapshots.',
  },
  liquidAssets: {
    summary: 'Cash and bank balances available without selling investments.',
    formula: 'Sum of all liquid fund balances',
    ideal: 'Enough for emergencies plus short-term needs; see liquidity ratio (10–25%).',
  },
  totalDebt: {
    summary: 'All loan outstanding balances — home, car, personal, etc.',
    formula: 'Sum of loan outstandingBalance across all loans',
    ideal: 'Keep debt-to-asset ratio ≤ 30–50%; EMI burden ≤ 40% of income.',
  },
  monthlyOutflow: {
    summary: 'Recurring cash leaving your account each month (normalized to monthly).',
    formula: 'Sum of active recurring expenses converted to monthly equivalent',
    ideal: 'Should leave ≥ 20% of income as surplus after all recurring items.',
  },
  pnlBreakdown: {
    summary: 'Unrealized gain or loss on investments where you entered cost and current price.',
    formula: 'Current value − invested cost, grouped by equity, crypto, physical assets, and FD maturity estimate',
    ideal: 'Positive long-term returns; review laggards and rebalance if one bucket dominates.',
  },
  investmentComparison: {
    summary: 'Compares return % across asset types to see which bucket performed best.',
    formula: 'ROI = (current − invested) / invested × 100; FD/PPF/PF show interest rate p.a.',
    ideal: 'Diversified portfolio; equity/crypto higher volatility, FD/PPF/PF lower but stable returns.',
  },
  financeBuckets: {
    summary: 'How your total assets split across each finance bucket you track.',
    formula: 'Each bucket current value as % of total assets',
    ideal: 'Balanced mix: liquid 10–25%, growth assets (equity+crypto) aligned to risk, PPF/PF for long-term.',
  },
  assetAllocation: {
    summary: 'Pie view of the same bucket split — quick visual of concentration risk.',
    formula: 'Same as finance buckets, shown as proportional slices',
    ideal: 'Avoid > 40% in a single bucket unless intentional (e.g. home equity in Real Estate).',
  },
  assetsLiabilities: {
    summary: 'Side-by-side view of what you own versus what you owe.',
    formula: 'Total assets vs sum of loan outstanding balances',
    ideal: 'Assets significantly larger than liabilities; gap = net worth.',
  },
  netWorthTrend: {
    summary: 'Tracks net worth over months when you click “Record snapshot”.',
    formula: 'Snapshot: total assets − total liabilities per month',
    ideal: 'Upward or flat trend; investigate dips in P&L or new debt.',
  },
  spendAnalysis: {
    summary: 'Where recurring money goes — EMIs, subscriptions, rent, SIPs, etc.',
    formula: 'Active recurring expenses grouped by category, monthly equivalent',
    ideal: 'EMIs ≤ 40% income; subscriptions trimmed; SIP counts toward savings.',
  },
  cashFlow: {
    summary: 'Monthly income vs recurring outflow and what is left over.',
    formula: 'Surplus = monthly income − total monthly recurring outflow',
    ideal: 'Positive surplus ≥ 20% of income for savings and investments.',
  },
  recurringBreakdown: {
    summary: 'Bar chart of largest recurring categories by monthly cost.',
    formula: 'Monthly equivalent per recurring category',
    ideal: 'EMI + rent + utilities predictable; discretionary spend under control.',
  },
  upcomingMaturities: {
    summary: 'Fixed deposits maturing in the next 90 days.',
    formula: 'FDs with maturityDate within 90 days from today',
    ideal: 'Plan reinvestment or liquidity needs before maturity dates.',
  },
  insights: {
    summary: 'Automated alerts based on your ratios vs common personal finance guidelines.',
    formula: 'Rule engine checks EMI, emergency fund, insurance, debt, stale prices',
    ideal: 'Mostly green/success insights; warnings need a plan.',
  },
  keyRatios: {
    summary: 'Quick health check of liquidity, safety buffers, debt, insurance, and savings.',
    formula: 'See each ratio row for its specific formula',
    ideal: 'Most ratios in “good” status; address “warn” and “bad” first.',
  },
} satisfies Record<string, WidgetGuideContent>;

export function buildDashboardAssessments(state: FinanceState): MetricAssessment[] {
  const spend = spendAnalysis(state);
  return [
    assessNetWorth(netWorth(state), state),
    assessLiquidityRatio(liquidityRatio(state)),
    assessEmergencyMonths(emergencyFundMonths(state)),
    assessDebtToAsset(debtToAssetRatio(state)),
    assessEmiBurden(emiBurdenPercent(state)),
    assessInsuranceCoverage(insuranceCoverageRatio(state)),
    assessSavingsRate(spend.savingsRate),
  ];
}

export function buildOverviewAssessments(state: FinanceState) {
  const spend = spendAnalysis(state);
  const nw = netWorth(state);
  return {
    netWorth: assessNetWorth(nw, state),
    liquid: {
      ...assessLiquidityRatio(liquidityRatio(state)),
      value: formatCompactForState(totalLiquidAssets(state), state),
    },
    debt: {
      ...assessDebtToAsset(debtToAssetRatio(state)),
      value: formatCompactForState(totalLiabilities(state), state),
    },
    outflow: {
      ...(spend.savingsRate != null
        ? assessSavingsRate(spend.savingsRate)
        : assessEmiBurden(emiBurdenPercent(state))),
      value: formatCompactForState(monthlyOutflow(state), state),
    },
    pnl: {
      label: 'Unrealized P&L',
      value: formatCompactForState(unrealizedPnL(state), state),
      ideal: 'Positive over long horizons; update stale prices regularly',
      deviation:
        unrealizedPnL(state) >= 0
          ? 'Mark-to-market gains on equity & crypto'
          : 'Mark-to-market losses — review cost basis and allocation',
      status: (unrealizedPnL(state) >= 0 ? 'good' : 'warn') as DeviationStatus,
    },
    totalAssets: {
      label: 'Total assets',
      value: formatCompactForState(totalAssetsValue(state), state),
      ideal: 'Diversified across buckets; grows with savings and returns',
      deviation: `${formatCompactForState(totalAssetsValue(state), state)} across all buckets`,
      status: 'neutral' as DeviationStatus,
    },
    pnlSummary: totalPnLSummary(state),
  };
}
