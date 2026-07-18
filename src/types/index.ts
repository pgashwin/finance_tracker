export type RecurrenceFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

export type RecurringCategory =
  | 'emi'
  | 'subscription'
  | 'insurance_premium'
  | 'rent'
  | 'utility'
  | 'investment_sip'
  | 'other';

export type HoldingInstrumentType = 'mutual_fund' | 'stock' | 'etf' | 'bond';
export type LoanType = 'home' | 'car' | 'personal' | 'education' | 'gold' | 'other';
export type InsuranceType = 'term' | 'endowment' | 'ulip' | 'health' | 'other';
export type RetirementAccountType = 'ppf' | 'epf' | 'nps' | 'other';
export type AssetCategory = 'real_estate' | 'vehicle' | 'gold' | 'jewelry' | 'other';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

export interface LiquidFund extends BaseEntity {
  type: 'liquid_fund';
  name: string;
  institution?: string;
  balance: number;
  accountNumber?: string;
  isEmergencyFund: boolean;
}

export interface FixedDeposit extends BaseEntity {
  type: 'fixed_deposit';
  name: string;
  institution: string;
  principal: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  maturityAmount?: number;
  autoRenew: boolean;
  taxDeductedAtSource: boolean;
}

export interface Holding extends BaseEntity {
  type: 'holding';
  instrumentType: HoldingInstrumentType;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  lastUpdated: string;
  broker: 'zerodha' | 'other';
  folioNumber?: string;
  sector?: string;
}

export interface CryptoHolding extends BaseEntity {
  type: 'crypto';
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  lastUpdated: string;
  exchange: 'coindcx' | 'other';
  quoteCurrency: 'INR';
}

export interface RecurringExpense extends BaseEntity {
  type: 'recurring_expense';
  name: string;
  category: RecurringCategory;
  amount: number;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  autoDebit: boolean;
  linkedLoanId?: string;
  isActive: boolean;
}

export interface Loan extends BaseEntity {
  type: 'loan';
  name: string;
  loanType: LoanType;
  lender: string;
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  emiAmount: number;
  tenureMonths: number;
  startDate: string;
  linkedAssetId?: string;
}

export interface InsurancePolicy extends BaseEntity {
  type: 'insurance';
  policyName: string;
  insurer: string;
  policyNumber?: string;
  insuranceType: InsuranceType;
  sumAssured: number;
  annualPremium: number;
  premiumFrequency: RecurrenceFrequency;
  startDate: string;
  maturityDate?: string;
  nominees?: string;
  isActive: boolean;
}

export interface RetirementAccount extends BaseEntity {
  type: 'retirement_account';
  accountType: RetirementAccountType;
  name: string;
  accountNumber?: string;
  currentBalance: number;
  annualContribution?: number;
  employerContribution?: number;
  interestRate?: number;
  maturityDate?: string;
  startDate: string;
}

export interface Asset extends BaseEntity {
  type: 'asset';
  name: string;
  category: AssetCategory;
  purchasePrice: number;
  currentEstimatedValue: number;
  purchaseDate: string;
  lastValuationDate: string;
  linkedLoanId?: string;
  location?: string;
}

export interface UserProfile {
  displayName?: string;
  baseCurrency: 'INR';
  monthlyIncome?: number;
  financialYearStart: 'april';
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultDashboardPeriod: 'monthly' | 'yearly';
  showCents: boolean;
}

export interface MonthlySnapshot {
  month: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface FinanceState {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  profile: UserProfile;
  settings: AppSettings;
  liquidFunds: LiquidFund[];
  fixedDeposits: FixedDeposit[];
  holdings: Holding[];
  cryptoHoldings: CryptoHolding[];
  recurringExpenses: RecurringExpense[];
  loans: Loan[];
  insurancePolicies: InsurancePolicy[];
  retirementAccounts: RetirementAccount[];
  assets: Asset[];
  snapshots: MonthlySnapshot[];
}

export interface Insight {
  severity: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  actionRoute?: string;
}

export const SCHEMA_VERSION = 2;
export const APP_VERSION = '1.0.0';
