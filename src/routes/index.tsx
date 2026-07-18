import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { LiquidFundsPage } from '@/pages/LiquidFundsPage';
import { FixedDepositsPage } from '@/pages/FixedDepositsPage';
import { HoldingsPage } from '@/pages/HoldingsPage';
import { HoldingsImportPage } from '@/pages/HoldingsImportPage';
import { CryptoPage } from '@/pages/CryptoPage';
import { CryptoImportPage } from '@/pages/CryptoImportPage';
import { RecurringPage } from '@/pages/RecurringPage';
import { LoansPage } from '@/pages/LoansPage';
import { InsurancePage } from '@/pages/InsurancePage';
import { RetirementPage } from '@/pages/RetirementPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ChatPage } from '@/pages/ChatPage';

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="liquid-funds" element={<LiquidFundsPage />} />
          <Route path="fixed-deposits" element={<FixedDepositsPage />} />
          <Route path="holdings" element={<HoldingsPage />} />
          <Route path="holdings/import" element={<HoldingsImportPage />} />
          <Route path="crypto" element={<CryptoPage />} />
          <Route path="crypto/import" element={<CryptoImportPage />} />
          <Route path="recurring" element={<RecurringPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="insurance" element={<InsurancePage />} />
          <Route path="retirement" element={<RetirementPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
