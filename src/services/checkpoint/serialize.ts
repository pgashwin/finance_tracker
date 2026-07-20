import type { FinanceState } from '@/types';
import { financeStateSchema } from '@/schemas/checkpoint';
import { migrateCheckpoint } from '@/services/checkpoint/migrate';
import { dedupeSnapshots } from '@/services/analytics/netWorth';
import { APP_VERSION, SCHEMA_VERSION } from '@/types';

export function serializeState(state: FinanceState): string {
  const payload: FinanceState = {
    ...state,
    snapshots: dedupeSnapshots(state.snapshots),
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
  };
  return JSON.stringify(payload, null, 2);
}

export function deserializeState(json: string): FinanceState {
  const raw = JSON.parse(json) as Record<string, unknown>;
  const migrated = migrateCheckpoint(raw);
  const parsed = financeStateSchema.parse(migrated);

  if (parsed.schemaVersion > SCHEMA_VERSION) {
    throw new Error(
      `Checkpoint was created with a newer app version (schema v${parsed.schemaVersion}). Please update the app.`,
    );
  }

  return {
    ...parsed,
    snapshots: dedupeSnapshots(parsed.snapshots),
  } as FinanceState;
}

export function checkpointSummary(state: FinanceState, label = 'Checkpoint loaded'): string {
  const counts = [
    state.liquidFunds.length,
    state.fixedDeposits.length,
    state.holdings.length,
    (state.cryptoHoldings ?? []).length,
    state.loans.length,
    state.recurringExpenses.length,
    state.insurancePolicies.length,
    state.retirementAccounts.length,
    state.assets.length,
  ];
  const total = counts.reduce((sum, count) => sum + count, 0);
  const categories = counts.filter((count) => count > 0).length;
  return `${label} — ${total} record${total === 1 ? '' : 's'} across ${categories} categor${categories === 1 ? 'y' : 'ies'}`;
}

export function defaultCheckpointFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  return `finance-checkpoint-${date}.ftcheckpoint`;
}
