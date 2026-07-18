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

export function checkpointSummary(state: FinanceState): string {
  const parts = [
    `${state.liquidFunds.length} liquid fund(s)`,
    `${state.fixedDeposits.length} FD(s)`,
    `${state.holdings.length} holding(s)`,
    `${state.cryptoHoldings.length} crypto holding(s)`,
    `${state.loans.length} loan(s)`,
    `${state.recurringExpenses.length} recurring expense(s)`,
    `${state.insurancePolicies.length} insurance policy(ies)`,
    `${state.retirementAccounts.length} PPF/PF account(s)`,
    `${state.assets.length} asset(s)`,
  ];
  return `Loaded ${parts.join(', ')}`;
}

export function defaultCheckpointFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  return `finance-checkpoint-${date}.ftcheckpoint`;
}
