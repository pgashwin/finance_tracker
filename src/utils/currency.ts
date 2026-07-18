import type { RecurrenceFrequency } from '@/types';

export function formatINR(amount: number, showCents = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

export function formatCompactINR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  return formatINR(amount);
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
