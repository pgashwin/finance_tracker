import { useFinanceStore } from '@/store/financeStore';
import type { CurrencyCode } from '@/constants/currencies';
import {
  convertToBase,
  formatCompactMoney,
  formatMoney,
  getCurrencySymbol,
} from '@/utils/currency';

export function useCurrency() {
  const baseCurrency = useFinanceStore((s) => s.state.profile.baseCurrency);
  const showCents = useFinanceStore((s) => s.state.settings.showCents);
  const exchangeRates = useFinanceStore((s) => s.state.settings.exchangeRates);

  return {
    baseCurrency,
    showCents,
    exchangeRates,
    symbol: getCurrencySymbol(baseCurrency),
    format: (amount: number, currency: CurrencyCode = baseCurrency) =>
      formatMoney(amount, currency, showCents),
    formatCompact: (amount: number, currency: CurrencyCode = baseCurrency) =>
      formatCompactMoney(amount, currency, showCents),
    toBase: (amount: number, currency: CurrencyCode = baseCurrency) =>
      convertToBase(amount, currency, baseCurrency, exchangeRates),
  };
}
