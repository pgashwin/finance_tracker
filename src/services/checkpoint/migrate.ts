import type { FinanceState } from '@/types';
import { SCHEMA_VERSION } from '@/types';
import { isCurrencyCode } from '@/constants/currencies';

export function migrateCheckpoint(raw: Record<string, unknown>): Record<string, unknown> {
  const data = { ...raw };
  const version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;

  if (version < 2) {
    if (!Array.isArray(data.cryptoHoldings)) {
      data.cryptoHoldings = [];
    }
    data.schemaVersion = 2;
  }

  if (version < 3) {
    const profile =
      data.profile && typeof data.profile === 'object'
        ? { ...(data.profile as Record<string, unknown>) }
        : {};
    if (!isCurrencyCode(String(profile.baseCurrency ?? 'INR'))) {
      profile.baseCurrency = 'INR';
    }

    const settings =
      data.settings && typeof data.settings === 'object'
        ? { ...(data.settings as Record<string, unknown>) }
        : {};
    if (!settings.exchangeRates || typeof settings.exchangeRates !== 'object') {
      settings.exchangeRates = {};
    }

    data.profile = profile;
    data.settings = settings;
    data.schemaVersion = 3;
  }

  if (typeof data.schemaVersion !== 'number' || data.schemaVersion < SCHEMA_VERSION) {
    data.schemaVersion = SCHEMA_VERSION;
  }

  return data;
}

export function ensureCryptoHoldings(state: FinanceState): FinanceState {
  if (state.cryptoHoldings) return state;
  return { ...state, cryptoHoldings: [] };
}
