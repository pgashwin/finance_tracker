import { create } from 'zustand';
import type {
  Asset,
  FinanceState,
  FixedDeposit,
  Holding,
  CryptoHolding,
  InsurancePolicy,
  LiquidFund,
  Loan,
  RecurringExpense,
  RetirementAccount,
  UserProfile,
  AppSettings,
} from '@/types';
import { createEmptyState } from '@/schemas/checkpoint';
import { generateId, nowIso } from '@/utils/ids';
import { recordSnapshot } from '@/services/analytics/netWorth';

interface FinanceStore {
  state: FinanceState;
  isDirty: boolean;
  loadedFileName: string | null;
  hasLoadedCheckpoint: boolean;
  toast: { message: string; id: number } | null;

  setState: (state: FinanceState) => void;
  markClean: (fileName?: string) => void;
  markDirty: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  resetToEmpty: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  recordMonthlySnapshot: () => void;

  addLiquidFund: (data: Omit<LiquidFund, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateLiquidFund: (id: string, data: Partial<LiquidFund>) => void;
  deleteLiquidFund: (id: string) => void;

  addFixedDeposit: (data: Omit<FixedDeposit, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateFixedDeposit: (id: string, data: Partial<FixedDeposit>) => void;
  deleteFixedDeposit: (id: string) => void;

  addHolding: (data: Omit<Holding, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateHolding: (id: string, data: Partial<Holding>) => void;
  deleteHolding: (id: string) => void;
  setHoldings: (holdings: Holding[]) => void;

  addCryptoHolding: (data: Omit<CryptoHolding, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateCryptoHolding: (id: string, data: Partial<CryptoHolding>) => void;
  deleteCryptoHolding: (id: string) => void;
  setCryptoHoldings: (holdings: CryptoHolding[]) => void;

  addRecurringExpense: (data: Omit<RecurringExpense, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateRecurringExpense: (id: string, data: Partial<RecurringExpense>) => void;
  deleteRecurringExpense: (id: string) => void;

  addLoan: (data: Omit<Loan, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateLoan: (id: string, data: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;

  addInsurancePolicy: (data: Omit<InsurancePolicy, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateInsurancePolicy: (id: string, data: Partial<InsurancePolicy>) => void;
  deleteInsurancePolicy: (id: string) => void;

  addRetirementAccount: (data: Omit<RetirementAccount, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateRetirementAccount: (id: string, data: Partial<RetirementAccount>) => void;
  deleteRetirementAccount: (id: string) => void;

  addAsset: (data: Omit<Asset, keyof import('@/types').BaseEntity | 'type'>) => void;
  updateAsset: (id: string, data: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
}

function createEntity<T extends { id: string; createdAt: string; updatedAt: string }>(
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
): T {
  const now = nowIso();
  return { ...data, id: generateId(), createdAt: now, updatedAt: now } as T;
}

function updateEntity<T extends { id: string; updatedAt: string }>(
  items: T[],
  id: string,
  data: Partial<T>,
): T[] {
  return items.map((item) =>
    item.id === id ? { ...item, ...data, updatedAt: nowIso() } : item,
  );
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  state: createEmptyState(),
  isDirty: false,
  loadedFileName: null,
  hasLoadedCheckpoint: false,
  toast: null,

  setState: (state) => set({ state }),
  markClean: (fileName) =>
    set({ isDirty: false, hasLoadedCheckpoint: true, loadedFileName: fileName ?? get().loadedFileName }),
  markDirty: () => set({ isDirty: true }),
  showToast: (message) => set({ toast: { message, id: Date.now() } }),
  clearToast: () => set({ toast: null }),
  resetToEmpty: () =>
    set({
      state: createEmptyState(),
      isDirty: false,
      loadedFileName: null,
      hasLoadedCheckpoint: false,
    }),

  updateProfile: (profile) => {
    set((s) => ({
      state: { ...s.state, profile: { ...s.state.profile, ...profile } },
      isDirty: true,
    }));
  },

  updateSettings: (settings) => {
    set((s) => ({
      state: { ...s.state, settings: { ...s.state.settings, ...settings } },
      isDirty: true,
    }));
  },

  recordMonthlySnapshot: () => {
    set((s) => ({
      state: recordSnapshot(s.state),
      isDirty: true,
    }));
  },

  addLiquidFund: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        liquidFunds: [...s.state.liquidFunds, createEntity<LiquidFund>({ type: 'liquid_fund', ...data })],
      },
      isDirty: true,
    })),
  updateLiquidFund: (id, data) =>
    set((s) => ({
      state: { ...s.state, liquidFunds: updateEntity(s.state.liquidFunds, id, data) },
      isDirty: true,
    })),
  deleteLiquidFund: (id) =>
    set((s) => ({
      state: { ...s.state, liquidFunds: s.state.liquidFunds.filter((x) => x.id !== id) },
      isDirty: true,
    })),

  addFixedDeposit: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        fixedDeposits: [...s.state.fixedDeposits, createEntity<FixedDeposit>({ type: 'fixed_deposit', ...data })],
      },
      isDirty: true,
    })),
  updateFixedDeposit: (id, data) =>
    set((s) => ({
      state: { ...s.state, fixedDeposits: updateEntity(s.state.fixedDeposits, id, data) },
      isDirty: true,
    })),
  deleteFixedDeposit: (id) =>
    set((s) => ({
      state: { ...s.state, fixedDeposits: s.state.fixedDeposits.filter((x) => x.id !== id) },
      isDirty: true,
    })),

  addHolding: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        holdings: [...s.state.holdings, createEntity<Holding>({ type: 'holding', ...data })],
      },
      isDirty: true,
    })),
  updateHolding: (id, data) =>
    set((s) => ({
      state: { ...s.state, holdings: updateEntity(s.state.holdings, id, data) },
      isDirty: true,
    })),
  deleteHolding: (id) =>
    set((s) => ({
      state: { ...s.state, holdings: s.state.holdings.filter((x) => x.id !== id) },
      isDirty: true,
    })),
  setHoldings: (holdings) =>
    set((s) => ({ state: { ...s.state, holdings }, isDirty: true })),

  addCryptoHolding: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        cryptoHoldings: [
          ...(s.state.cryptoHoldings ?? []),
          createEntity<CryptoHolding>({ type: 'crypto', ...data }),
        ],
      },
      isDirty: true,
    })),
  updateCryptoHolding: (id, data) =>
    set((s) => ({
      state: {
        ...s.state,
        cryptoHoldings: updateEntity(s.state.cryptoHoldings ?? [], id, data),
      },
      isDirty: true,
    })),
  deleteCryptoHolding: (id) =>
    set((s) => ({
      state: {
        ...s.state,
        cryptoHoldings: (s.state.cryptoHoldings ?? []).filter((x) => x.id !== id),
      },
      isDirty: true,
    })),
  setCryptoHoldings: (cryptoHoldings) =>
    set((s) => ({ state: { ...s.state, cryptoHoldings }, isDirty: true })),

  addRecurringExpense: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        recurringExpenses: [
          ...s.state.recurringExpenses,
          createEntity<RecurringExpense>({ type: 'recurring_expense', ...data }),
        ],
      },
      isDirty: true,
    })),
  updateRecurringExpense: (id, data) =>
    set((s) => ({
      state: { ...s.state, recurringExpenses: updateEntity(s.state.recurringExpenses, id, data) },
      isDirty: true,
    })),
  deleteRecurringExpense: (id) =>
    set((s) => ({
      state: { ...s.state, recurringExpenses: s.state.recurringExpenses.filter((x) => x.id !== id) },
      isDirty: true,
    })),

  addLoan: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        loans: [...s.state.loans, createEntity<Loan>({ type: 'loan', ...data })],
      },
      isDirty: true,
    })),
  updateLoan: (id, data) =>
    set((s) => ({
      state: { ...s.state, loans: updateEntity(s.state.loans, id, data) },
      isDirty: true,
    })),
  deleteLoan: (id) =>
    set((s) => ({
      state: { ...s.state, loans: s.state.loans.filter((x) => x.id !== id) },
      isDirty: true,
    })),

  addInsurancePolicy: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        insurancePolicies: [
          ...s.state.insurancePolicies,
          createEntity<InsurancePolicy>({ type: 'insurance', ...data }),
        ],
      },
      isDirty: true,
    })),
  updateInsurancePolicy: (id, data) =>
    set((s) => ({
      state: { ...s.state, insurancePolicies: updateEntity(s.state.insurancePolicies, id, data) },
      isDirty: true,
    })),
  deleteInsurancePolicy: (id) =>
    set((s) => ({
      state: { ...s.state, insurancePolicies: s.state.insurancePolicies.filter((x) => x.id !== id) },
      isDirty: true,
    })),

  addRetirementAccount: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        retirementAccounts: [
          ...s.state.retirementAccounts,
          createEntity<RetirementAccount>({ type: 'retirement_account', ...data }),
        ],
      },
      isDirty: true,
    })),
  updateRetirementAccount: (id, data) =>
    set((s) => ({
      state: { ...s.state, retirementAccounts: updateEntity(s.state.retirementAccounts, id, data) },
      isDirty: true,
    })),
  deleteRetirementAccount: (id) =>
    set((s) => ({
      state: {
        ...s.state,
        retirementAccounts: s.state.retirementAccounts.filter((x) => x.id !== id),
      },
      isDirty: true,
    })),

  addAsset: (data) =>
    set((s) => ({
      state: {
        ...s.state,
        assets: [...s.state.assets, createEntity<Asset>({ type: 'asset', ...data })],
      },
      isDirty: true,
    })),
  updateAsset: (id, data) =>
    set((s) => ({
      state: { ...s.state, assets: updateEntity(s.state.assets, id, data) },
      isDirty: true,
    })),
  deleteAsset: (id) =>
    set((s) => ({
      state: { ...s.state, assets: s.state.assets.filter((x) => x.id !== id) },
      isDirty: true,
    })),
}));
