export const SUPPORTED_CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  { code: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', label: 'Euro (€)', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'AED', label: 'UAE Dirham (د.إ)', locale: 'en-AE' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', locale: 'en-SG' },
  { code: 'CAD', label: 'Canadian Dollar (C$)', locale: 'en-CA' },
  { code: 'AUD', label: 'Australian Dollar (A$)', locale: 'en-AU' },
  { code: 'JPY', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
  { code: 'CHF', label: 'Swiss Franc (CHF)', locale: 'de-CH' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

export const CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_CODES.includes(value as CurrencyCode);
}

export function getCurrencyMeta(code: CurrencyCode) {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)!;
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return new Intl.NumberFormat(getCurrencyMeta(code).locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(0)
    .replace(/[\d\s.,]/g, '')
    .trim();
}
