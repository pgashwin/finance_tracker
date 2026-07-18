import type { FinanceState } from '@/types';
import {
  cryptoCurrentValue,
  cryptoInvestedValue,
  holdingCurrentValue,
  holdingInvestedValue,
  monthlyOutflow,
  physicalAssetsByCategory,
  totalAssetsValue,
  totalFixedDeposits,
  totalHoldingsValue,
  totalCryptoValue,
  totalLiquidAssets,
  totalLiabilities,
  totalRetirement,
  activeRecurringExpenses,
} from './netWorth';
import { BUCKET_COLORS } from '@/constants/chartColors';
import { toMonthlyEquivalent, entityAmountInBase } from '@/utils/currency';

export { BUCKET_COLORS };

export interface PnLSlice {
  name: string;
  invested: number;
  current: number;
  pnl: number;
  pnlPercent: number | null;
  color: string;
}

export interface FinanceBucketRow {
  bucket: string;
  currentValue: number;
  investedBasis: number;
  percentOfAssets: number;
  pnl: number;
  color: string;
}

export interface SpendCategoryRow {
  category: string;
  label: string;
  monthly: number;
  annual: number;
  percentOfOutflow: number;
}

export interface SpendAnalysis {
  categories: SpendCategoryRow[];
  totalMonthly: number;
  totalAnnual: number;
  fixedMonthly: number;
  discretionaryMonthly: number;
  investmentMonthly: number;
  incomeMonthly: number | null;
  surplusMonthly: number | null;
  savingsRate: number | null;
}

export interface InvestmentComparisonRow {
  type: string;
  invested: number;
  current: number;
  pnl: number;
  roiPercent: number | null;
  color: string;
}

const FIXED_CATEGORIES = new Set(['emi', 'rent', 'insurance_premium', 'utility']);
const INVESTMENT_CATEGORIES = new Set(['investment_sip']);

function roiPercent(invested: number, pnl: number): number | null {
  if (invested <= 0) return null;
  return (pnl / invested) * 100;
}

function sumHoldingsInvested(state: FinanceState): number {
  return state.holdings.reduce(
    (s, h) => s + entityAmountInBase(holdingInvestedValue(h), h.currency, state),
    0,
  );
}

function sumHoldingsCurrent(state: FinanceState): number {
  return state.holdings.reduce(
    (s, h) => s + entityAmountInBase(holdingCurrentValue(h), h.currency, state),
    0,
  );
}

function sumCryptoInvested(state: FinanceState): number {
  return (state.cryptoHoldings ?? []).reduce(
    (s, h) => s + entityAmountInBase(cryptoInvestedValue(h), h.quoteCurrency, state),
    0,
  );
}

function sumCryptoCurrent(state: FinanceState): number {
  return (state.cryptoHoldings ?? []).reduce(
    (s, h) => s + entityAmountInBase(cryptoCurrentValue(h), h.quoteCurrency, state),
    0,
  );
}

function sumPhysicalInvested(state: FinanceState): number {
  return state.assets.reduce(
    (s, a) => s + entityAmountInBase(a.purchasePrice, a.currency, state),
    0,
  );
}

function sumPhysicalCurrent(state: FinanceState): number {
  return state.assets.reduce(
    (s, a) => s + entityAmountInBase(a.currentEstimatedValue, a.currency, state),
    0,
  );
}

function physicalAssetPnLSlices(state: FinanceState): PnLSlice[] {
  return physicalAssetsByCategory(state).map((cat) => {
    const pnl = cat.current - cat.invested;
    return {
      name: cat.label,
      invested: cat.invested,
      current: cat.current,
      pnl,
      pnlPercent: roiPercent(cat.invested, pnl),
      color: cat.color,
    };
  });
}

export function pnlBreakdown(state: FinanceState): PnLSlice[] {
  const slices: PnLSlice[] = [];

  const equityInvested = sumHoldingsInvested(state);
  const equityCurrent = sumHoldingsCurrent(state);
  if (equityInvested > 0 || equityCurrent > 0) {
    const pnl = equityCurrent - equityInvested;
    slices.push({
      name: 'Equity (Stocks/MF)',
      invested: equityInvested,
      current: equityCurrent,
      pnl,
      pnlPercent: roiPercent(equityInvested, pnl),
      color: BUCKET_COLORS.Equity!,
    });
  }

  const cryptoInvested = sumCryptoInvested(state);
  const cryptoCurrent = sumCryptoCurrent(state);
  if (cryptoInvested > 0 || cryptoCurrent > 0) {
    const pnl = cryptoCurrent - cryptoInvested;
    slices.push({
      name: 'Crypto',
      invested: cryptoInvested,
      current: cryptoCurrent,
      pnl,
      pnlPercent: roiPercent(cryptoInvested, pnl),
      color: BUCKET_COLORS.Crypto!,
    });
  }

  const physicalInvested = sumPhysicalInvested(state);
  const physicalCurrent = sumPhysicalCurrent(state);
  if (physicalInvested > 0 || physicalCurrent > 0) {
    slices.push(...physicalAssetPnLSlices(state));
  }

  const fdPrincipal = totalFixedDeposits(state);
  const fdMaturity = state.fixedDeposits.reduce(
    (s, fd) =>
      s + entityAmountInBase(fd.maturityAmount ?? fd.principal, fd.currency, state),
    0,
  );
  if (fdPrincipal > 0) {
    const pnl = fdMaturity - fdPrincipal;
    slices.push({
      name: 'Fixed Deposits',
      invested: fdPrincipal,
      current: fdMaturity,
      pnl,
      pnlPercent: roiPercent(fdPrincipal, pnl),
      color: BUCKET_COLORS['Fixed Deposits']!,
    });
  }

  return slices.sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
}

export function financeBucketsSummary(state: FinanceState): FinanceBucketRow[] {
  const totalAssets = totalAssetsValue(state);
  if (totalAssets === 0) return [];

  const buckets: FinanceBucketRow[] = [
    {
      bucket: 'Liquid',
      currentValue: totalLiquidAssets(state),
      investedBasis: totalLiquidAssets(state),
      percentOfAssets: 0,
      pnl: 0,
      color: BUCKET_COLORS.Liquid!,
    },
    {
      bucket: 'Fixed Deposits',
      currentValue: totalFixedDeposits(state),
      investedBasis: totalFixedDeposits(state),
      percentOfAssets: 0,
      pnl: 0,
      color: BUCKET_COLORS['Fixed Deposits']!,
    },
    {
      bucket: 'Equity',
      currentValue: totalHoldingsValue(state),
      investedBasis: sumHoldingsInvested(state),
      percentOfAssets: 0,
      pnl: sumHoldingsCurrent(state) - sumHoldingsInvested(state),
      color: BUCKET_COLORS.Equity!,
    },
    {
      bucket: 'Crypto',
      currentValue: totalCryptoValue(state),
      investedBasis: sumCryptoInvested(state),
      percentOfAssets: 0,
      pnl: sumCryptoCurrent(state) - sumCryptoInvested(state),
      color: BUCKET_COLORS.Crypto!,
    },
    {
      bucket: 'PPF / PF',
      currentValue: totalRetirement(state),
      investedBasis: totalRetirement(state),
      percentOfAssets: 0,
      pnl: 0,
      color: BUCKET_COLORS['PPF / PF']!,
    },
    ...physicalAssetsByCategory(state).map((cat) => ({
      bucket: cat.label,
      currentValue: cat.current,
      investedBasis: cat.invested,
      percentOfAssets: 0,
      pnl: cat.current - cat.invested,
      color: cat.color,
    })),
  ]
    .filter((b) => b.currentValue > 0)
    .map((b) => ({
      ...b,
      percentOfAssets: (b.currentValue / totalAssets) * 100,
    }))
    .sort((a, b) => b.currentValue - a.currentValue);

  return buckets;
}

export function spendAnalysis(state: FinanceState): SpendAnalysis {
  const categories: SpendCategoryRow[] = [];
  let fixedMonthly = 0;
  let discretionaryMonthly = 0;
  let investmentMonthly = 0;

  for (const e of activeRecurringExpenses(state)) {
    const monthly = entityAmountInBase(
      toMonthlyEquivalent(e.amount, e.frequency),
      e.currency,
      state,
    );
    if (FIXED_CATEGORIES.has(e.category)) fixedMonthly += monthly;
    else if (INVESTMENT_CATEGORIES.has(e.category)) investmentMonthly += monthly;
    else discretionaryMonthly += monthly;
  }

  const totalMonthly = monthlyOutflow(state);
  const map = new Map<string, number>();
  for (const e of activeRecurringExpenses(state)) {
    const monthly = entityAmountInBase(
      toMonthlyEquivalent(e.amount, e.frequency),
      e.currency,
      state,
    );
    map.set(e.category, (map.get(e.category) ?? 0) + monthly);
  }

  for (const [category, monthly] of map.entries()) {
    categories.push({
      category,
      label: category.replace(/_/g, ' '),
      monthly,
      annual: monthly * 12,
      percentOfOutflow: totalMonthly > 0 ? (monthly / totalMonthly) * 100 : 0,
    });
  }
  categories.sort((a, b) => b.monthly - a.monthly);

  const incomeMonthly = state.profile.monthlyIncome ?? null;
  const surplusMonthly = incomeMonthly != null ? incomeMonthly - totalMonthly : null;
  const savingsRate =
    incomeMonthly != null && incomeMonthly > 0 && surplusMonthly != null
      ? (surplusMonthly / incomeMonthly) * 100
      : null;

  return {
    categories,
    totalMonthly,
    totalAnnual: totalMonthly * 12,
    fixedMonthly,
    discretionaryMonthly,
    investmentMonthly,
    incomeMonthly,
    surplusMonthly,
    savingsRate,
  };
}

export function investmentTypeComparison(state: FinanceState): InvestmentComparisonRow[] {
  const rows: InvestmentComparisonRow[] = [];

  const byInstrument = new Map<string, { invested: number; current: number }>();
  for (const h of state.holdings) {
    const key =
      h.instrumentType === 'mutual_fund'
        ? 'Mutual Funds'
        : h.instrumentType === 'stock'
          ? 'Stocks'
          : h.instrumentType === 'etf'
            ? 'ETFs'
            : 'Bonds';
    const cur = byInstrument.get(key) ?? { invested: 0, current: 0 };
    cur.invested += entityAmountInBase(holdingInvestedValue(h), h.currency, state);
    cur.current += entityAmountInBase(holdingCurrentValue(h), h.currency, state);
    byInstrument.set(key, cur);
  }
  for (const [type, v] of byInstrument.entries()) {
    if (v.invested <= 0) continue;
    const pnl = v.current - v.invested;
    rows.push({
      type,
      invested: v.invested,
      current: v.current,
      pnl,
      roiPercent: roiPercent(v.invested, pnl),
      color: BUCKET_COLORS.Equity!,
    });
  }

  const cryptoInvested = sumCryptoInvested(state);
  if (cryptoInvested > 0) {
    const cryptoCurrent = sumCryptoCurrent(state);
    const pnl = cryptoCurrent - cryptoInvested;
    rows.push({
      type: 'Crypto',
      invested: cryptoInvested,
      current: cryptoCurrent,
      pnl,
      roiPercent: roiPercent(cryptoInvested, pnl),
      color: BUCKET_COLORS.Crypto!,
    });
  }

  const physicalInvested = sumPhysicalInvested(state);
  if (physicalInvested > 0) {
    for (const cat of physicalAssetsByCategory(state)) {
      if (cat.invested <= 0) continue;
      const pnl = cat.current - cat.invested;
      rows.push({
        type: cat.label,
        invested: cat.invested,
        current: cat.current,
        pnl,
        roiPercent: roiPercent(cat.invested, pnl),
        color: cat.color,
      });
    }
  }

  const fdPrincipal = totalFixedDeposits(state);
  if (fdPrincipal > 0) {
    const weightedRate =
      state.fixedDeposits.reduce((s, fd) => s + fd.interestRate * fd.principal, 0) / fdPrincipal;
    rows.push({
      type: 'Fixed Deposits (rate)',
      invested: fdPrincipal,
      current: fdPrincipal,
      pnl: 0,
      roiPercent: weightedRate,
      color: BUCKET_COLORS['Fixed Deposits']!,
    });
  }

  const retirement = totalRetirement(state);
  if (retirement > 0) {
    const withRate = state.retirementAccounts.filter((a) => a.interestRate);
    const weightedRate =
      withRate.length > 0
        ? withRate.reduce((s, a) => s + (a.interestRate ?? 0) * a.currentBalance, 0) /
          withRate.reduce((s, a) => s + a.currentBalance, 0)
        : null;
    rows.push({
      type: 'PPF / PF (rate)',
      invested: retirement,
      current: retirement,
      pnl: 0,
      roiPercent: weightedRate,
      color: BUCKET_COLORS['PPF / PF']!,
    });
  }

  return rows
    .filter((r) => r.roiPercent != null || r.pnl !== 0)
    .sort((a, b) => (b.roiPercent ?? 0) - (a.roiPercent ?? 0));
}

export function assetsVsLiabilitiesSummary(state: FinanceState) {
  return {
    assets: totalAssetsValue(state),
    liabilities: totalLiabilities(state),
    netWorth: totalAssetsValue(state) - totalLiabilities(state),
  };
}

export function debtByType(state: FinanceState) {
  const map = new Map<string, number>();
  for (const loan of state.loans) {
    map.set(
      loan.loanType,
      (map.get(loan.loanType) ?? 0) +
        entityAmountInBase(loan.outstandingBalance, loan.currency, state),
    );
  }
  return Array.from(map.entries())
    .map(([type, amount]) => ({
      type: type.replace(/_/g, ' '),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function totalPnLSummary(state: FinanceState) {
  const breakdown = pnlBreakdown(state);
  const totalInvested = breakdown.reduce((s, x) => s + x.invested, 0);
  const totalCurrent = breakdown.reduce((s, x) => s + x.current, 0);
  const totalPnl = breakdown.reduce((s, x) => s + x.pnl, 0);
  return {
    totalInvested,
    totalCurrent,
    totalPnl,
    totalPnlPercent: roiPercent(totalInvested, totalPnl),
    breakdown,
  };
}
