import type { RecurrenceFrequency, FinanceState, ExchangeRates } from '@/types';
import type { CurrencyCode } from '@/constants/currencies';
import { getCurrencyMeta } from '@/constants/currencies';

export function convertToBase(
  amount: number,
  fromCurrency: CurrencyCode,
  baseCurrency: CurrencyCode,
  rates: ExchangeRates,
): number {
  if (fromCurrency === baseCurrency) return amount;
  const rate = rates[fromCurrency];
  if (!rate || rate <= 0) return amount;
  return amount * rate;
}

export function entityAmountInBase(
  amount: number,
  entityCurrency: CurrencyCode | undefined,
  state: FinanceState,
): number {
  const base = state.profile.baseCurrency;
  return convertToBase(amount, entityCurrency ?? base, base, state.settings.exchangeRates ?? {});
}

export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  showCents = false,
): string {
  const { locale } = getCurrencyMeta(currency);
  const fractionDigits = currency === 'JPY' ? 0 : showCents ? 2 : 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatCompactMoney(
  amount: number,
  currency: CurrencyCode,
  showCents = false,
): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const symbol = new Intl.NumberFormat(getCurrencyMeta(currency).locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(0)
    .replace(/[\d\s.,]/g, '')
    .trim();

  if (currency === 'INR') {
    if (abs >= 1_00_00_000) return `${sign}${symbol}${(abs / 1_00_00_000).toFixed(2)} Cr`;
    if (abs >= 1_00_000) return `${sign}${symbol}${(abs / 1_00_000).toFixed(2)} L`;
    return formatMoney(amount, currency, showCents);
  }

  if (abs >= 1_000_000_000) return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}K`;
  return formatMoney(amount, currency, showCents);
}

/** @deprecated Use formatMoney(amount, currency) or useCurrency().format */
export function formatINR(amount: number, showCents = false): string {
  return formatMoney(amount, 'INR', showCents);
}

/** @deprecated Use formatCompactMoney(amount, currency) or useCurrency().formatCompact */
export function formatCompactINR(amount: number): string {
  return formatCompactMoney(amount, 'INR');
}

export function formatForState(
  amount: number,
  state: FinanceState,
  currency?: CurrencyCode,
): string {
  return formatMoney(
    amount,
    currency ?? state.profile.baseCurrency,
    state.settings.showCents,
  );
}

export function formatCompactForState(amount: number, state: FinanceState): string {
  return formatCompactMoney(amount, state.profile.baseCurrency, state.settings.showCents);
}

export function toMonthlyEquivalent(amount: number, frequency: RecurrenceFrequency): number {
  const factors: Record<RecurrenceFrequency, number> = {
    monthly: 1,
    quarterly: 1 / 3,
    half_yearly: 1 / 6,
    yearly: 1 / 12,
  };
  return amount * factors[frequency];
}

export function toAnnualEquivalent(amount: number, frequency: RecurrenceFrequency): number {
  return toMonthlyEquivalent(amount, frequency) * 12;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export { getCurrencySymbol } from '@/constants/currencies';
