import type { FinanceState } from '@/types';
import {
  assetAllocation,
  debtToAssetRatio,
  emiBurdenPercent,
  emergencyFundMonths,
  insuranceCoverageRatio,
  liquidityRatio,
  monthlyOutflow,
  netWorth,
  recurringByCategory,
  totalAssetsValue,
  totalLiabilities,
  upcomingMaturities,
  holdingCurrentValue,
  cryptoCurrentValue,
} from '@/services/analytics/netWorth';
import {
  financeBucketsSummary,
  spendAnalysis,
  totalPnLSummary,
} from '@/services/analytics/portfolioAnalytics';
import { generateInsights } from '@/services/analytics/insights';
import { entityAmountInBase } from '@/utils/currency';

export interface PortfolioContextOptions {
  redactSensitiveIds?: boolean;
  maxTopHoldings?: number;
  maxInsights?: number;
}

export interface PortfolioContext {
  baseCurrency: string;
  asOf: string;
  displayName?: string;
  summary: {
    netWorth: number;
    totalAssets: number;
    totalDebt: number;
    monthlyOutflow: number;
    monthlyIncome: number | null;
    savingsRate: number | null;
    unrealizedPnl: number;
  };
  ratios: {
    liquidityRatio: number;
    emergencyFundMonths: number | null;
    emiBurdenPercent: number | null;
    debtToAssetRatio: number;
    insuranceCoverageRatio: number | null;
  };
  allocation: Array<{ name: string; value: number; percent: number }>;
  financeBuckets: Array<{ bucket: string; currentValue: number; percentOfAssets: number; pnl: number }>;
  spendBreakdown: Array<{ category: string; monthly: number; percentOfOutflow: number }>;
  topHoldings: Array<{ symbol: string; name: string; type: string; value: number }>;
  recurringByCategory: Array<{ category: string; amount: number }>;
  upcomingMaturities: Array<{ name: string; date: string; amount: number; type: string }>;
  ruleBasedInsights: Array<{ severity: string; title: string; description: string }>;
  snapshotTrend: Array<{ month: string; netWorth: number }>;
}

const DEFAULT_MAX_HOLDINGS = 10;
const DEFAULT_MAX_INSIGHTS = 8;
const MAX_SNAPSHOT_POINTS = 12;

function redactId(value: string | undefined, redact: boolean): string | undefined {
  if (!redact || !value) return value;
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

export function buildPortfolioContext(
  state: FinanceState,
  options: PortfolioContextOptions = {},
): PortfolioContext {
  const redact = options.redactSensitiveIds ?? true;
  const maxHoldings = options.maxTopHoldings ?? DEFAULT_MAX_HOLDINGS;
  const maxInsights = options.maxInsights ?? DEFAULT_MAX_INSIGHTS;

  const spend = spendAnalysis(state);
  const pnl = totalPnLSummary(state);
  const totalAssets = totalAssetsValue(state);

  const holdings = [
    ...state.holdings.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      type: h.instrumentType,
      value: entityAmountInBase(holdingCurrentValue(h), h.currency, state),
      folio: redactId(h.folioNumber, redact),
    })),
    ...(state.cryptoHoldings ?? []).map((h) => ({
      symbol: h.symbol,
      name: h.name,
      type: 'crypto',
      value: entityAmountInBase(cryptoCurrentValue(h), h.quoteCurrency, state),
      folio: undefined as string | undefined,
    })),
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, maxHoldings)
    .map(({ symbol, name, type, value }) => ({ symbol, name, type, value }));

  const allocation = assetAllocation(state);
  const allocationTotal = allocation.reduce((s, a) => s + a.value, 0) || 1;

  const snapshots = [...(state.snapshots ?? [])]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-MAX_SNAPSHOT_POINTS)
    .map((s) => ({ month: s.month, netWorth: s.netWorth }));

  return {
    baseCurrency: state.profile.baseCurrency,
    asOf: new Date().toISOString().slice(0, 10),
    displayName: state.profile.displayName,
    summary: {
      netWorth: netWorth(state),
      totalAssets,
      totalDebt: totalLiabilities(state),
      monthlyOutflow: monthlyOutflow(state),
      monthlyIncome: spend.incomeMonthly,
      savingsRate: spend.savingsRate,
      unrealizedPnl: pnl.totalPnl,
    },
    ratios: {
      liquidityRatio: liquidityRatio(state),
      emergencyFundMonths: emergencyFundMonths(state),
      emiBurdenPercent: emiBurdenPercent(state),
      debtToAssetRatio: debtToAssetRatio(state),
      insuranceCoverageRatio: insuranceCoverageRatio(state),
    },
    allocation: allocation.map((a) => ({
      name: a.name,
      value: a.value,
      percent: (a.value / allocationTotal) * 100,
    })),
    financeBuckets: financeBucketsSummary(state).map((b) => ({
      bucket: b.bucket,
      currentValue: b.currentValue,
      percentOfAssets: b.percentOfAssets,
      pnl: b.pnl,
    })),
    spendBreakdown: spend.categories.slice(0, 8).map((c) => ({
      category: c.label,
      monthly: c.monthly,
      percentOfOutflow: c.percentOfOutflow,
    })),
    topHoldings: holdings,
    recurringByCategory: recurringByCategory(state),
    upcomingMaturities: upcomingMaturities(state, 90),
    ruleBasedInsights: generateInsights(state)
      .slice(0, maxInsights)
      .map(({ severity, title, description }) => ({ severity, title, description })),
    snapshotTrend: snapshots,
  };
}

export function formatPortfolioContextForPrompt(context: PortfolioContext): string {
  return JSON.stringify(context, null, 0);
}

export function estimateContextSizeBytes(context: PortfolioContext): number {
  return new TextEncoder().encode(formatPortfolioContextForPrompt(context)).length;
}
