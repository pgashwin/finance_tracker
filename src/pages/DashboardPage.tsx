import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/financeStore';
import { deserializeState, checkpointSummary } from '@/services/checkpoint/serialize';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { AssetAllocationChart } from '@/components/dashboard/AssetAllocationChart';
import { NetWorthChart } from '@/components/dashboard/NetWorthChart';
import { RecurringBreakdownChart } from '@/components/dashboard/RecurringBreakdownChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { UpcomingMaturities } from '@/components/dashboard/UpcomingMaturities';
import { PnLBreakdownChart } from '@/components/dashboard/PnLBreakdownChart';
import { FinanceBucketsChart } from '@/components/dashboard/FinanceBucketsChart';
import { SpendAnalysisChart } from '@/components/dashboard/SpendAnalysisChart';
import { InvestmentComparisonChart } from '@/components/dashboard/InvestmentComparisonChart';
import { AssetsLiabilitiesChart } from '@/components/dashboard/AssetsLiabilitiesChart';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { MetricGuideRow, WidgetGuide } from '@/components/dashboard/WidgetGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  WIDGET_GUIDES,
  buildDashboardAssessments,
  buildOverviewAssessments,
} from '@/content/dashboardGuides';
import {
  netWorth,
  totalLiquidAssets,
  totalLiabilities,
  monthlyOutflow,
  liquidityRatio,
  debtToAssetRatio,
  emiBurdenPercent,
  assetAllocation,
  recurringByCategory,
  upcomingMaturities,
} from '@/services/analytics/netWorth';
import {
  totalPnLSummary,
  financeBucketsSummary,
  spendAnalysis,
  investmentTypeComparison,
  assetsVsLiabilitiesSummary,
} from '@/services/analytics/portfolioAnalytics';
import { generateInsights } from '@/services/analytics/insights';
import { formatCompactINR, formatPercent } from '@/utils/currency';
import { TrendingUp, Wallet, CreditCard, Repeat, Camera } from 'lucide-react';

export function DashboardPage() {
  const state = useFinanceStore((s) => s.state);
  const hasLoadedCheckpoint = useFinanceStore((s) => s.hasLoadedCheckpoint);
  const recordMonthlySnapshot = useFinanceStore((s) => s.recordMonthlySnapshot);
  const fmt = (n: number) => formatCompactINR(n);

  const nw = netWorth(state);
  const insights = generateInsights(state);
  const emiBurden = emiBurdenPercent(state);

  const pnlSummary = totalPnLSummary(state);
  const buckets = financeBucketsSummary(state);
  const spend = spendAnalysis(state);
  const investmentCompare = investmentTypeComparison(state);
  const assetsLiabilities = assetsVsLiabilitiesSummary(state);
  const overview = buildOverviewAssessments(state);
  const ratioAssessments = buildDashboardAssessments(state);

  const isEmpty =
    state.liquidFunds.length === 0 &&
    state.fixedDeposits.length === 0 &&
    state.holdings.length === 0 &&
    (state.cryptoHoldings ?? []).length === 0 &&
    state.loans.length === 0;

  const setState = useFinanceStore((s) => s.setState);
  const markClean = useFinanceStore((s) => s.markClean);
  const showToast = useFinanceStore((s) => s.showToast);

  const loadDemo = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}demo.ftcheckpoint`);
      const json = await res.text();
      const loaded = deserializeState(json);
      setState(loaded);
      markClean('demo.ftcheckpoint');
      showToast(checkpointSummary(loaded));
    } catch {
      showToast('Failed to load demo data');
    }
  };

  if (isEmpty && !hasLoadedCheckpoint) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <h2 className="text-2xl font-bold">Welcome to Finance Tracker</h2>
        <p className="text-muted-foreground">
          Your privacy-first personal finance dashboard. All data stays on your device — load an
          existing checkpoint or start adding your financial information.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/liquid-funds">
            <Button>Start adding data</Button>
          </Link>
          <Button variant="outline" onClick={loadDemo}>
            Load demo data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          {state.profile.displayName && (
            <p className="text-muted-foreground">Hello, {state.profile.displayName}</p>
          )}
        </div>
        <Button variant="outline" onClick={recordMonthlySnapshot}>
          <Camera className="h-4 w-4" />
          Record snapshot
        </Button>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Overview</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Net Worth"
            value={fmt(nw)}
            trend={nw >= 0 ? 'positive' : 'negative'}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            guide={WIDGET_GUIDES.netWorth}
            assessment={overview.netWorth}
          />
          <KpiCard
            title="Liquid Assets"
            value={fmt(totalLiquidAssets(state))}
            subtitle={`Liquidity: ${formatPercent(liquidityRatio(state))}`}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            guide={WIDGET_GUIDES.liquidAssets}
            assessment={overview.liquid}
          />
          <KpiCard
            title="Total Debt"
            value={fmt(totalLiabilities(state))}
            subtitle={`Debt/Assets: ${formatPercent(debtToAssetRatio(state))}`}
            trend="negative"
            icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            guide={WIDGET_GUIDES.totalDebt}
            assessment={overview.debt}
          />
          <KpiCard
            title="Monthly Outflow"
            value={fmt(monthlyOutflow(state))}
            subtitle={
              emiBurden != null ? `EMI burden: ${formatPercent(emiBurden)}` : 'Set income in Settings'
            }
            icon={<Repeat className="h-4 w-4 text-muted-foreground" />}
            guide={WIDGET_GUIDES.monthlyOutflow}
            assessment={overview.outflow}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Profit & Loss</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <PnLBreakdownChart
            data={pnlSummary.breakdown}
            totalPnl={pnlSummary.totalPnl}
            guide={WIDGET_GUIDES.pnlBreakdown}
          />
          <InvestmentComparisonChart data={investmentCompare} guide={WIDGET_GUIDES.investmentComparison} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Asset Buckets & Allocation</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <FinanceBucketsChart data={buckets} guide={WIDGET_GUIDES.financeBuckets} />
          <AssetAllocationChart data={assetAllocation(state)} guide={WIDGET_GUIDES.assetAllocation} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AssetsLiabilitiesChart
            assets={assetsLiabilities.assets}
            liabilities={assetsLiabilities.liabilities}
            netWorth={assetsLiabilities.netWorth}
            guide={WIDGET_GUIDES.assetsLiabilities}
          />
          <NetWorthChart snapshots={state.snapshots} guide={WIDGET_GUIDES.netWorthTrend} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Spending & Cash Flow</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <SpendAnalysisChart analysis={spend} guide={WIDGET_GUIDES.spendAnalysis} />
          <CashFlowChart
            income={spend.incomeMonthly}
            expenses={spend.totalMonthly}
            surplus={spend.surplusMonthly}
            investmentSip={spend.investmentMonthly}
            guide={WIDGET_GUIDES.cashFlow}
          />
        </div>
        <RecurringBreakdownChart data={recurringByCategory(state)} guide={WIDGET_GUIDES.recurringBreakdown} />
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Ratios & Alerts</h3>
        <Card>
          <CardHeader>
            <CardTitle>Key Ratios</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ratioAssessments.map((metric) => (
                <MetricGuideRow
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  ideal={metric.ideal}
                  deviation={metric.deviation}
                  status={metric.status}
                />
              ))}
              <MetricGuideRow
                label={overview.pnl.label}
                value={overview.pnl.value}
                ideal={overview.pnl.ideal}
                deviation={overview.pnl.deviation}
                status={overview.pnl.status}
              />
            </dl>
            <WidgetGuide guide={WIDGET_GUIDES.keyRatios} />
          </CardContent>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <UpcomingMaturities items={upcomingMaturities(state)} guide={WIDGET_GUIDES.upcomingMaturities} />
          <InsightsPanel insights={insights} guide={WIDGET_GUIDES.insights} />
        </div>
      </section>
    </div>
  );
}
