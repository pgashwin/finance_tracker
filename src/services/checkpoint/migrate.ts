import type { FinanceState } from '@/types';
import { SCHEMA_VERSION } from '@/types';

export function migrateCheckpoint(raw: Record<string, unknown>): Record<string, unknown> {
  const data = { ...raw };
  const version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;

  if (version < 2) {
    if (!Array.isArray(data.cryptoHoldings)) {
      data.cryptoHoldings = [];
    }
    data.schemaVersion = 2;
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
