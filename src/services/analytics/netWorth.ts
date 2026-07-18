import type { AssetCategory, FinanceState, Holding, CryptoHolding, MonthlySnapshot, RecurringExpense } from '@/types';
import { entityAmountInBase, toMonthlyEquivalent } from '@/utils/currency';

export function holdingInvestedValue(h: Holding): number {
  return h.quantity * h.averagePrice;
}

export function holdingCurrentValue(h: Holding): number {
  return h.quantity * h.currentPrice;
}

export function holdingGainLoss(h: Holding): number {
  return holdingCurrentValue(h) - holdingInvestedValue(h);
}

export function cryptoInvestedValue(h: CryptoHolding): number {
  return h.quantity * h.averageBuyPrice;
}

export function cryptoCurrentValue(h: CryptoHolding): number {
  return h.quantity * h.currentPrice;
}

export function cryptoGainLoss(h: CryptoHolding): number {
  return cryptoCurrentValue(h) - cryptoInvestedValue(h);
}

export function totalCryptoValue(state: FinanceState): number {
  return (state.cryptoHoldings ?? []).reduce(
    (sum, h) => sum + entityAmountInBase(cryptoCurrentValue(h), h.quoteCurrency, state),
    0,
  );
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  real_estate: 'Real Estate',
  vehicle: 'Vehicle',
  gold: 'Gold',
  jewelry: 'Jewelry',
  other: 'Other Assets',
};

export const ASSET_CATEGORY_COLORS: Record<AssetCategory, string> = {
  real_estate: '#ef4444',
  vehicle: '#6366f1',
  gold: '#eab308',
  jewelry: '#ec4899',
  other: '#6b7280',
};

export interface AssetCategoryTotals {
  category: AssetCategory;
  label: string;
  invested: number;
  current: number;
  color: string;
}

export function physicalAssetsByCategory(state: FinanceState): AssetCategoryTotals[] {
  const map = new Map<AssetCategory, { invested: number; current: number }>();
  for (const asset of state.assets) {
    const totals = map.get(asset.category) ?? { invested: 0, current: 0 };
    totals.invested += entityAmountInBase(asset.purchasePrice, asset.currency, state);
    totals.current += entityAmountInBase(asset.currentEstimatedValue, asset.currency, state);
    map.set(asset.category, totals);
  }

  return Array.from(map.entries())
    .filter(([, totals]) => totals.current > 0 || totals.invested > 0)
    .map(([category, totals]) => ({
      category,
      label: ASSET_CATEGORY_LABELS[category],
      invested: totals.invested,
      current: totals.current,
      color: ASSET_CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.current - a.current);
}

export function totalLiquidAssets(state: FinanceState): number {
  return state.liquidFunds.reduce(
    (sum, f) => sum + entityAmountInBase(f.balance, f.currency, state),
    0,
  );
}

export function totalEmergencyFund(state: FinanceState): number {
  return state.liquidFunds
    .filter((f) => f.isEmergencyFund)
    .reduce((sum, f) => sum + entityAmountInBase(f.balance, f.currency, state), 0);
}

export function totalFixedDeposits(state: FinanceState): number {
  return state.fixedDeposits.reduce(
    (sum, fd) => sum + entityAmountInBase(fd.principal, fd.currency, state),
    0,
  );
}

export function totalHoldingsValue(state: FinanceState): number {
  return state.holdings.reduce(
    (sum, h) => sum + entityAmountInBase(holdingCurrentValue(h), h.currency, state),
    0,
  );
}

export function totalRetirement(state: FinanceState): number {
  return state.retirementAccounts.reduce(
    (sum, a) => sum + entityAmountInBase(a.currentBalance, a.currency, state),
    0,
  );
}

export function totalAssetsValue(state: FinanceState): number {
  return (
    totalLiquidAssets(state) +
    totalFixedDeposits(state) +
    totalHoldingsValue(state) +
    totalCryptoValue(state) +
    totalRetirement(state) +
    state.assets.reduce(
      (sum, a) => sum + entityAmountInBase(a.currentEstimatedValue, a.currency, state),
      0,
    )
  );
}

export function totalLiabilities(state: FinanceState): number {
  return state.loans.reduce(
    (sum, l) => sum + entityAmountInBase(l.outstandingBalance, l.currency, state),
    0,
  );
}

export function netWorth(state: FinanceState): number {
  return totalAssetsValue(state) - totalLiabilities(state);
}

export function activeRecurringExpenses(state: FinanceState): RecurringExpense[] {
  const today = new Date().toISOString().split('T')[0]!;
  return state.recurringExpenses.filter(
    (e) => e.isActive && (!e.endDate || e.endDate >= today),
  );
}

export function monthlyOutflow(state: FinanceState): number {
  return activeRecurringExpenses(state).reduce(
    (sum, e) =>
      sum +
      entityAmountInBase(toMonthlyEquivalent(e.amount, e.frequency), e.currency, state),
    0,
  );
}

export function emiMonthlyTotal(state: FinanceState): number {
  return activeRecurringExpenses(state)
    .filter((e) => e.category === 'emi')
    .reduce(
      (sum, e) =>
        sum +
        entityAmountInBase(toMonthlyEquivalent(e.amount, e.frequency), e.currency, state),
      0,
    );
}

export function liquidityRatio(state: FinanceState): number {
  const assets = totalAssetsValue(state);
  if (assets === 0) return 0;
  return (totalLiquidAssets(state) / assets) * 100;
}

export function debtToAssetRatio(state: FinanceState): number {
  const assets = totalAssetsValue(state);
  if (assets === 0) return 0;
  return (totalLiabilities(state) / assets) * 100;
}

export function emiBurdenPercent(state: FinanceState): number | null {
  const income = state.profile.monthlyIncome;
  if (!income || income === 0) return null;
  return (emiMonthlyTotal(state) / income) * 100;
}

export function emergencyFundMonths(state: FinanceState): number | null {
  const outflow = monthlyOutflow(state);
  if (outflow === 0) return null;
  return totalEmergencyFund(state) / outflow;
}

export function termInsuranceCoverage(state: FinanceState): number {
  return state.insurancePolicies
    .filter((p) => p.isActive && p.insuranceType === 'term')
    .reduce((sum, p) => sum + entityAmountInBase(p.sumAssured, p.currency, state), 0);
}

export function insuranceCoverageRatio(state: FinanceState): number | null {
  const income = state.profile.monthlyIncome;
  if (!income) return null;
  const annualIncome = income * 12;
  if (annualIncome === 0) return null;
  return termInsuranceCoverage(state) / annualIncome;
}

export function unrealizedPnL(state: FinanceState): number {
  const equityPnl = state.holdings.reduce(
    (sum, h) =>
      sum +
      entityAmountInBase(holdingCurrentValue(h), h.currency, state) -
      entityAmountInBase(holdingInvestedValue(h), h.currency, state),
    0,
  );
  const cryptoPnl = (state.cryptoHoldings ?? []).reduce(
    (sum, h) =>
      sum +
      entityAmountInBase(cryptoCurrentValue(h), h.quoteCurrency, state) -
      entityAmountInBase(cryptoInvestedValue(h), h.quoteCurrency, state),
    0,
  );
  return equityPnl + cryptoPnl;
}

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
}

const ALLOCATION_COLORS: Record<string, string> = {
  Liquid: '#3b82f6',
  'Fixed Deposits': '#8b5cf6',
  Equity: '#10b981',
  Crypto: '#06b6d4',
  'PPF / PF': '#f59e0b',
  Other: '#6b7280',
};

export function assetAllocation(state: FinanceState): AllocationSlice[] {
  const liquid = totalLiquidAssets(state);
  const fds = totalFixedDeposits(state);
  const equity = totalHoldingsValue(state);
  const crypto = totalCryptoValue(state);
  const retirement = totalRetirement(state);

  const slices: AllocationSlice[] = [
    { name: 'Liquid', value: liquid, color: ALLOCATION_COLORS.Liquid! },
    { name: 'Fixed Deposits', value: fds, color: ALLOCATION_COLORS['Fixed Deposits']! },
    { name: 'Equity', value: equity, color: ALLOCATION_COLORS.Equity! },
    { name: 'Crypto', value: crypto, color: ALLOCATION_COLORS.Crypto! },
    { name: 'PPF / PF', value: retirement, color: ALLOCATION_COLORS['PPF / PF']! },
    ...physicalAssetsByCategory(state).map((cat) => ({
      name: cat.label,
      value: cat.current,
      color: cat.color,
    })),
  ].filter((s) => s.value > 0);

  return slices;
}

export interface RecurringBreakdown {
  category: string;
  amount: number;
}

export function recurringByCategory(state: FinanceState): RecurringBreakdown[] {
  const map = new Map<string, number>();
  for (const e of activeRecurringExpenses(state)) {
    const monthly = entityAmountInBase(
      toMonthlyEquivalent(e.amount, e.frequency),
      e.currency,
      state,
    );
    map.set(e.category, (map.get(e.category) ?? 0) + monthly);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MaturityItem {
  name: string;
  date: string;
  amount: number;
  type: string;
}

export function upcomingMaturities(state: FinanceState, withinDays = 90): MaturityItem[] {
  const items: MaturityItem[] = [];

  for (const fd of state.fixedDeposits) {
    const days = Math.ceil(
      (new Date(fd.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (days >= 0 && days <= withinDays) {
      items.push({
        name: fd.name,
        date: fd.maturityDate,
        amount: entityAmountInBase(fd.maturityAmount ?? fd.principal, fd.currency, state),
        type: 'Fixed Deposit',
      });
    }
  }

  return items.sort((a, b) => a.date.localeCompare(b.date));
}

/** Normalize snapshot month keys to YYYY-MM (handles YYYY-M and YYYY-MM-DD). */
export function normalizeSnapshotMonth(month: string): string {
  const match = month.match(/^(\d{4})-(\d{1,2})/);
  if (!match) return month;
  return `${match[1]}-${match[2]!.padStart(2, '0')}`;
}

/** Keep only the latest snapshot per calendar month; later entries win. */
export function dedupeSnapshots(snapshots: MonthlySnapshot[]): MonthlySnapshot[] {
  const byMonth = new Map<string, MonthlySnapshot>();
  for (const snapshot of snapshots) {
    const month = normalizeSnapshotMonth(snapshot.month);
    byMonth.set(month, { ...snapshot, month });
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function recordSnapshot(state: FinanceState): FinanceState {
  const month = normalizeSnapshotMonth(new Date().toISOString().slice(0, 7));
  const snapshot: MonthlySnapshot = {
    month,
    totalAssets: totalAssetsValue(state),
    totalLiabilities: totalLiabilities(state),
    netWorth: netWorth(state),
  };
  return {
    ...state,
    snapshots: dedupeSnapshots([...state.snapshots, snapshot]),
  };
}
