import { useFinanceStore } from '@/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { CurrencySelect } from '@/components/ui/currency-select';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';
import type { CurrencyCode } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';

import { AiAssistantSettingsCard } from '@/components/settings/AiAssistantSettingsCard';

export function SettingsPage() {
  const profile = useFinanceStore((s) => s.state.profile);
  const settings = useFinanceStore((s) => s.state.settings);
  const updateProfile = useFinanceStore((s) => s.updateProfile);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  const baseCurrency = profile.baseCurrency;
  const incomeSymbol = getCurrencySymbol(baseCurrency);
  const otherCurrencies = SUPPORTED_CURRENCIES.filter((c) => c.code !== baseCurrency);

  const setExchangeRate = (currency: CurrencyCode, value: string) => {
    const parsed = parseFloat(value);
    const nextRates = { ...settings.exchangeRates };
    if (!value || Number.isNaN(parsed) || parsed <= 0) {
      delete nextRates[currency];
    } else {
      nextRates[currency] = parsed;
    }
    updateSettings({ exchangeRates: nextRates });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Display Name</Label>
            <Input
              value={profile.displayName ?? ''}
              onChange={(e) => updateProfile({ displayName: e.target.value || undefined })}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label>Monthly Income ({incomeSymbol}, net take-home)</Label>
            <Input
              type="number"
              min="0"
              value={profile.monthlyIncome ?? ''}
              onChange={(e) =>
                updateProfile({
                  monthlyIncome: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="For EMI & insurance ratios"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter income in your base currency ({baseCurrency}).
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Base currency</Label>
            <CurrencySelect
              value={baseCurrency}
              onChange={(currency) => updateProfile({ baseCurrency: currency })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Dashboard totals and ratios are shown in this currency. Amounts without a currency
              tag use the base currency.
            </p>
          </div>
          <div className="space-y-3">
            <Label>Exchange rates to {baseCurrency}</Label>
            <p className="text-xs text-muted-foreground">
              Set how much 1 unit of another currency equals in {baseCurrency}. Example: if base is
              INR and 1 USD = 83.5 INR, enter 83.5 for USD.
            </p>
            {otherCurrencies.map((currency) => (
              <div key={currency.code} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm font-medium">{currency.code}</span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={settings.exchangeRates[currency.code] ?? ''}
                  onChange={(e) => setExchangeRate(currency.code, e.target.value)}
                  placeholder={`1 ${currency.code} = ? ${baseCurrency}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onChange={(e) =>
                updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.showCents}
              onChange={(e) => updateSettings({ showCents: e.target.checked })}
            />
            Show fractional units in currency amounts
          </label>
        </CardContent>
      </Card>
      <AiAssistantSettingsCard />
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All financial data lives in your checkpoint file on your device. This app does not send
            your checkpoint data to any server. The optional AI chat feature sends a portfolio
            summary to your chosen provider when you ask a question — configure it in AI Assistant
            above. Remember to save your checkpoint after making changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
