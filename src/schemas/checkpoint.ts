import { z } from 'zod';
import { APP_VERSION, SCHEMA_VERSION } from '@/types';
import { CURRENCY_CODES } from '@/constants/currencies';

const currencyCodeSchema = z.enum(CURRENCY_CODES);

const baseEntitySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const liquidFundSchema = baseEntitySchema.extend({
  type: z.literal('liquid_fund'),
  name: z.string().min(1),
  institution: z.string().optional(),
  balance: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  accountNumber: z.string().optional(),
  isEmergencyFund: z.boolean(),
});

export const fixedDepositSchema = baseEntitySchema.extend({
  type: z.literal('fixed_deposit'),
  name: z.string().min(1),
  institution: z.string().min(1),
  principal: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  interestRate: z.number().min(0),
  startDate: z.string(),
  maturityDate: z.string(),
  maturityAmount: z.number().optional(),
  autoRenew: z.boolean(),
  taxDeductedAtSource: z.boolean(),
});

export const holdingSchema = baseEntitySchema.extend({
  type: z.literal('holding'),
  instrumentType: z.enum(['mutual_fund', 'stock', 'etf', 'bond']),
  symbol: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().min(0),
  averagePrice: z.number().min(0),
  currentPrice: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  lastUpdated: z.string(),
  broker: z.enum(['zerodha', 'other']),
  folioNumber: z.string().optional(),
  sector: z.string().optional(),
});

export const cryptoHoldingSchema = baseEntitySchema.extend({
  type: z.literal('crypto'),
  symbol: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().min(0),
  averageBuyPrice: z.number().min(0),
  currentPrice: z.number().min(0),
  lastUpdated: z.string(),
  exchange: z.enum(['coindcx', 'other']),
  quoteCurrency: currencyCodeSchema.default('INR'),
});

export const recurringExpenseSchema = baseEntitySchema.extend({
  type: z.literal('recurring_expense'),
  name: z.string().min(1),
  category: z.enum([
    'emi',
    'subscription',
    'insurance_premium',
    'rent',
    'utility',
    'investment_sip',
    'other',
  ]),
  amount: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  frequency: z.enum(['monthly', 'quarterly', 'half_yearly', 'yearly']),
  startDate: z.string(),
  endDate: z.string().optional(),
  autoDebit: z.boolean(),
  linkedLoanId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const loanSchema = baseEntitySchema.extend({
  type: z.literal('loan'),
  name: z.string().min(1),
  loanType: z.enum(['home', 'car', 'personal', 'education', 'gold', 'other']),
  lender: z.string().min(1),
  principal: z.number().min(0),
  outstandingBalance: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  interestRate: z.number().min(0),
  emiAmount: z.number().min(0),
  tenureMonths: z.number().int().min(1),
  startDate: z.string(),
  linkedAssetId: z.string().optional(),
});

export const insurancePolicySchema = baseEntitySchema.extend({
  type: z.literal('insurance'),
  policyName: z.string().min(1),
  insurer: z.string().min(1),
  policyNumber: z.string().optional(),
  insuranceType: z.enum(['term', 'endowment', 'ulip', 'health', 'other']),
  sumAssured: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  annualPremium: z.number().min(0),
  premiumFrequency: z.enum(['monthly', 'quarterly', 'half_yearly', 'yearly']),
  startDate: z.string(),
  maturityDate: z.string().optional(),
  nominees: z.string().optional(),
  isActive: z.boolean(),
});

export const retirementAccountSchema = baseEntitySchema.extend({
  type: z.literal('retirement_account'),
  accountType: z.enum(['ppf', 'epf', 'nps', 'other']),
  name: z.string().min(1),
  accountNumber: z.string().optional(),
  currentBalance: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  annualContribution: z.number().optional(),
  employerContribution: z.number().optional(),
  interestRate: z.number().optional(),
  maturityDate: z.string().optional(),
  startDate: z.string(),
});

export const assetSchema = baseEntitySchema.extend({
  type: z.literal('asset'),
  name: z.string().min(1),
  category: z.enum(['real_estate', 'vehicle', 'gold', 'jewelry', 'other']),
  purchasePrice: z.number().min(0),
  currentEstimatedValue: z.number().min(0),
  currency: currencyCodeSchema.optional(),
  purchaseDate: z.string(),
  lastValuationDate: z.string(),
  linkedLoanId: z.string().optional(),
  location: z.string().optional(),
});

export const financeStateSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.string(),
  appVersion: z.string(),
  profile: z.object({
    displayName: z.string().optional(),
    baseCurrency: currencyCodeSchema.default('INR'),
    monthlyIncome: z.number().optional(),
    financialYearStart: z.literal('april'),
  }),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    defaultDashboardPeriod: z.enum(['monthly', 'yearly']),
    showCents: z.boolean(),
    exchangeRates: z.record(currencyCodeSchema, z.number().positive()).default({}),
  }),
  liquidFunds: z.array(liquidFundSchema),
  fixedDeposits: z.array(fixedDepositSchema),
  holdings: z.array(holdingSchema),
  cryptoHoldings: z.array(cryptoHoldingSchema).default([]),
  recurringExpenses: z.array(recurringExpenseSchema),
  loans: z.array(loanSchema),
  insurancePolicies: z.array(insurancePolicySchema),
  retirementAccounts: z.array(retirementAccountSchema),
  assets: z.array(assetSchema),
  snapshots: z.array(
    z.object({
      month: z.string(),
      totalAssets: z.number(),
      totalLiabilities: z.number(),
      netWorth: z.number(),
    }),
  ),
});

export function createEmptyState(): z.infer<typeof financeStateSchema> {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    profile: {
      baseCurrency: 'INR',
      financialYearStart: 'april',
    },
    settings: {
      theme: 'system',
      defaultDashboardPeriod: 'monthly',
      showCents: false,
      exchangeRates: {},
    },
    liquidFunds: [],
    fixedDeposits: [],
    holdings: [],
    cryptoHoldings: [],
    recurringExpenses: [],
    loans: [],
    insurancePolicies: [],
    retirementAccounts: [],
    assets: [],
    snapshots: [],
  };
}
