import type { FinanceState, Insight } from '@/types';
import { formatINR } from '@/utils/currency';
import {
  debtToAssetRatio,
  emiBurdenPercent,
  emergencyFundMonths,
  insuranceCoverageRatio,
  monthlyOutflow,
  netWorth,
  termInsuranceCoverage,
  upcomingMaturities,
} from './netWorth';

export function generateInsights(state: FinanceState): Insight[] {
  const insights: Insight[] = [];

  const coverageRatio = insuranceCoverageRatio(state);
  if (coverageRatio !== null) {
    if (coverageRatio < 5) {
      insights.push({
        severity: 'warning',
        title: 'Low term insurance coverage',
        description: `Term insurance covers ${coverageRatio.toFixed(1)}× annual income. Consider 10× as a guideline.`,
        actionRoute: '/insurance',
      });
    } else if (coverageRatio >= 10) {
      insights.push({
        severity: 'success',
        title: 'Adequate term insurance',
        description: `Term coverage (${formatINR(termInsuranceCoverage(state))}) is ${coverageRatio.toFixed(1)}× annual income.`,
        actionRoute: '/insurance',
      });
    }
  }

  const emergencyMonths = emergencyFundMonths(state);
  if (emergencyMonths !== null) {
    if (emergencyMonths < 3) {
      insights.push({
        severity: 'warning',
        title: 'Low emergency fund',
        description: `Emergency fund covers only ${emergencyMonths.toFixed(1)} months of expenses (target: 6 months).`,
        actionRoute: '/liquid-funds',
      });
    } else if (emergencyMonths >= 6) {
      insights.push({
        severity: 'success',
        title: 'Healthy emergency fund',
        description: `Emergency fund covers ${emergencyMonths.toFixed(1)} months of expenses.`,
        actionRoute: '/liquid-funds',
      });
    }
  }

  const emiBurden = emiBurdenPercent(state);
  if (emiBurden !== null) {
    if (emiBurden > 40) {
      insights.push({
        severity: 'warning',
        title: 'High EMI burden',
        description: `EMIs consume ${emiBurden.toFixed(0)}% of monthly income. Keep below 40% when possible.`,
        actionRoute: '/recurring',
      });
    } else if (emiBurden <= 25) {
      insights.push({
        severity: 'success',
        title: 'Healthy EMI burden',
        description: `EMI burden is ${emiBurden.toFixed(0)}% of monthly income.`,
        actionRoute: '/recurring',
      });
    }
  }

  const debtRatio = debtToAssetRatio(state);
  if (debtRatio > 50) {
    insights.push({
      severity: 'warning',
      title: 'High leverage',
      description: `Debt is ${debtRatio.toFixed(0)}% of total assets.`,
      actionRoute: '/loans',
    });
  }

  for (const m of upcomingMaturities(state, 30)) {
    insights.push({
      severity: 'info',
      title: `${m.type} maturing soon`,
      description: `${m.name} matures on ${m.date}: ${formatINR(m.amount)}`,
      actionRoute: '/fixed-deposits',
    });
  }

  const staleHoldings = state.holdings.filter((h) => {
    const days = (Date.now() - new Date(h.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return days > 90;
  });
  const staleCrypto = (state.cryptoHoldings ?? []).filter((h) => {
    const days = (Date.now() - new Date(h.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return days > 90;
  });
  if (staleHoldings.length > 0) {
    insights.push({
      severity: 'info',
      title: 'Stale holding prices',
      description: `${staleHoldings.length} equity holding(s) have prices not updated in 90+ days.`,
      actionRoute: '/holdings',
    });
  }
  if (staleCrypto.length > 0) {
    insights.push({
      severity: 'info',
      title: 'Stale crypto prices',
      description: `${staleCrypto.length} crypto holding(s) have prices not updated in 90+ days.`,
      actionRoute: '/crypto',
    });
  }

  if (state.snapshots.length >= 2) {
    const sorted = [...state.snapshots].sort((a, b) => a.month.localeCompare(b.month));
    const prev = sorted[sorted.length - 2]!;
    const current = netWorth(state);
    if (current < prev.netWorth) {
      insights.push({
        severity: 'warning',
        title: 'Net worth declined',
        description: `Net worth down ${formatINR(prev.netWorth - current)} since ${prev.month}.`,
        actionRoute: '/',
      });
    }
  }

  if (insights.length === 0 && monthlyOutflow(state) > 0) {
    insights.push({
      severity: 'info',
      title: 'Finances look balanced',
      description: 'No critical alerts. Review your dashboard ratios periodically.',
    });
  }

  return insights;
}
