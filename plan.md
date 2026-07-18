# Finance Tracker — Architecture & Development Plan

> **Version:** 1.0  
> **Last updated:** 2026-07-18  
> **Status:** Pre-development blueprint  
> **Hosting model:** GitHub Pages (static SPA)  
> **Data model:** Local-only checkpoints — no server, no cloud persistence

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [User Personas & Primary Workflows](#3-user-personas--primary-workflows)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Data Model](#6-data-model)
7. [Checkpoint File Specification](#7-checkpoint-file-specification)
8. [Feature Modules](#8-feature-modules)
9. [Dashboard Design](#9-dashboard-design)
10. [Zerodha / Holdings Import Strategy](#10-zerodha--holdings-import-strategy)
11. [UI/UX Principles & Information Architecture](#11-uiux-principles--information-architecture)
12. [Security & Privacy](#12-security--privacy)
13. [GitHub Pages Deployment](#13-github-pages-deployment)
14. [Project Structure](#14-project-structure)
15. [Development Phases](#15-development-phases)
16. [Testing Strategy](#16-testing-strategy)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Future Enhancements (Post-MVP)](#18-future-enhancements-post-mvp)
19. [Open Questions](#19-open-questions)
20. [Appendix](#20-appendix)

---

## 1. Executive Summary

This document defines the architecture for a **privacy-first, web-based personal finance tracker** that runs entirely in the browser and is hosted as a static site on GitHub Pages. The application aggregates liquid funds, fixed deposits, market holdings (mutual funds/stocks), recurring expenses, loans, insurance, retirement accounts (PPF/PF), and physical assets into a single **decision-oriented dashboard**.

**Core design principle:** The app is a *visualization and planning tool*, not a data custodian. All financial data lives in a **local checkpoint file** that the user explicitly saves to and loads from their device. Nothing is transmitted to or stored on any server.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Device                            │
│  ┌──────────────┐    save/load     ┌─────────────────────────┐  │
│  │  Checkpoint  │ ◄──────────────► │  Finance Tracker (SPA)  │  │
│  │  .json file  │   File System    │  React + GitHub Pages   │  │
│  └──────────────┘   Access API    └─────────────────────────┘  │
│         ▲                                    │                  │
│         │                                    ▼                  │
│    Local folder                      In-memory state            │
│    (Documents, etc.)                 (session only)             │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────┐
         │  GitHub Pages (static assets only)   │
         │  HTML / JS / CSS — NO user data      │
         └──────────────────────────────────────┘
```

---

## 2. Goals & Non-Goals

### Goals

| # | Goal | Success Criteria |
|---|------|------------------|
| G1 | Unified net-worth view | User sees total assets, liabilities, and net worth on dashboard within 3 seconds of loading checkpoint |
| G2 | Local data sovereignty | Zero network calls carrying financial data; checkpoint file is the single source of truth |
| G3 | Cross-platform access | Works on desktop (Chrome, Firefox, Safari, Edge) and mobile browsers |
| G4 | GitHub-hosted | Deployable via GitHub Actions to `username.github.io/finance_tracker` |
| G5 | Decision support | Dashboard surfaces liquidity ratio, debt-to-asset ratio, monthly burn, insurance coverage gap |
| G6 | Low friction data entry | Add/edit any entity in ≤ 3 clicks from dashboard |
| G7 | Zerodha holdings | Support CSV/XLSX upload from Zerodha yearly report; optional API pull in Phase 2 |

### Non-Goals (MVP)

- Multi-user accounts, authentication, or role-based access
- Cloud sync (Google Drive, Dropbox, Firebase, etc.)
- Real-time market price feeds (manual or import-based valuations only in MVP)
- Tax filing, ITR generation, or CA-grade reporting
- Native mobile apps (responsive web is sufficient)
- Transaction-level double-entry bookkeeping
- Automatic bank SMS parsing or open banking integrations

---

## 3. User Personas & Primary Workflows

### Persona: Ashwin (Primary User)

- Tracks personal and family finances across multiple instrument types
- Uses Zerodha for equity/MF holdings
- Wants a monthly "financial health check" without sharing data with third parties
- Comfortable saving a JSON file to a local folder

### Workflow A — First-Time Setup

```
Open app URL → See empty state → Add accounts manually OR import Zerodha report
→ Review dashboard → Save checkpoint to local folder (e.g. ~/Finance/checkpoint-2026-07.json)
```

### Workflow B — Monthly Update

```
Open app URL → Load checkpoint from local folder → Edit changed values
→ Dashboard reflects updates → Save new checkpoint (overwrite or new dated file)
```

### Workflow C — Decision Review

```
Load checkpoint → Dashboard → Filter by category → View ratios & projections
→ Identify: "EMIs consume 35% of income" → Drill into recurring expenses
```

### Workflow D — Mobile Quick Check

```
Open GitHub Pages URL on phone → Load checkpoint from Files app (iOS) or file picker (Android)
→ View read-only dashboard summary → Optionally edit and re-save
```

---

## 4. Technology Stack

### Recommended Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | React 18+ with TypeScript | Mature ecosystem, strong charting libraries, good mobile support |
| **Build tool** | Vite | Fast dev server, optimized static output for GitHub Pages |
| **Routing** | React Router (HashRouter) | GitHub Pages does not support server-side routing; hash routes avoid 404s |
| **State management** | Zustand | Lightweight, works well with immutable checkpoint snapshots |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid, accessible, mobile-first components |
| **Charts** | Recharts or Chart.js | Net worth trends, allocation pie charts, cash flow bars |
| **Forms** | React Hook Form + Zod | Type-safe validation aligned with data model |
| **File I/O** | Browser File System Access API + fallback `<input type="file">` | Native save/load dialogs where supported; fallback everywhere else |
| **CSV/XLSX parsing** | Papa Parse + SheetJS (xlsx) | Zerodha report upload |
| **Date handling** | date-fns | EMI schedules, maturity dates |
| **Testing** | Vitest + React Testing Library | Unit and component tests |
| **CI/CD** | GitHub Actions | Build and deploy to GitHub Pages on push to `main` |
| **PWA (optional Phase 2)** | vite-plugin-pwa | Installable on mobile home screen; still no cloud data |

### Why Not a Backend?

A backend (even serverless) introduces hosting cost, authentication complexity, and the temptation to store data remotely — directly conflicting with requirement #3. A pure SPA with file-based persistence is the correct architectural fit.

### Browser Compatibility Notes

| Feature | Chrome/Edge | Firefox | Safari (iOS) |
|---------|-------------|---------|--------------|
| File load (`<input>`) | ✅ | ✅ | ✅ |
| File save (download) | ✅ | ✅ | ✅ |
| File System Access API (save with picker) | ✅ | Partial | ❌ (use download fallback) |
| GitHub Pages hosting | ✅ | ✅ | ✅ |

---

## 5. System Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              App Shell                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │  Header     │  │  Sidebar /   │  │  Checkpoint │  │  Toast /      │  │
│  │  (branding) │  │  Bottom Nav  │  │  Manager    │  │  Notifications│  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                           Feature Pages                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Dashboard │ │ Liquid   │ │ Fixed    │ │ Holdings │ │ Recurring    │ │
│  │          │ │ Funds    │ │ Deposits │ │ (MF/Stk) │ │ Expenses     │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ Loans    │ │Insurance │ │ PPF / PF │ │ Assets   │                  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │
├─────────────────────────────────────────────────────────────────────────┤
│                           Core Services (client-side)                    │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐   │
│  │ Checkpoint     │ │ Analytics      │ │ Import Parsers             │   │
│  │ Service        │ │ Engine         │ │ (Zerodha CSV/XLSX)         │   │
│  └────────────────┘ └────────────────┘ └────────────────────────────┘   │
│  ┌────────────────┐ ┌────────────────┐                                │
│  │ Validation     │ │ Currency       │                                │
│  │ (Zod schemas)  │ │ Formatter (INR)│                                │
│  └────────────────┘ └────────────────┘                                │
├─────────────────────────────────────────────────────────────────────────┤
│                           State Store (Zustand)                          │
│                    FinanceState + UIState + DirtyFlag                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (add/edit/delete)
        │
        ▼
  Zustand Store (in-memory)
        │
        ├──► UI re-renders (dashboard, lists, forms)
        │
        └──► dirtyFlag = true
                    │
        User clicks "Save Checkpoint"
                    │
                    ▼
        CheckpointService.serialize(state)
                    │
                    ▼
        JSON file → user's local filesystem
                    │
        User clicks "Load Checkpoint"
                    │
                    ▼
        CheckpointService.deserialize(file)
                    │
                    ▼
        Zustand Store hydrated → dirtyFlag = false
```

### Unsaved Changes Guard

- Track `isDirty` boolean in store
- On navigation away / tab close: `beforeunload` warning if dirty
- Visual indicator in header: "Unsaved changes" badge
- Prompt to save before loading a new checkpoint

---

## 6. Data Model

All entities share common base fields for auditability inside the checkpoint file.

### Base Entity

```typescript
interface BaseEntity {
  id: string;           // UUID v4
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
  notes?: string;       // Free-text user notes
  tags?: string[];      // Optional grouping ("family", "emergency", etc.)
}
```

### 6.1 Liquid Funds

Cash and cash-equivalents held in bank accounts, wallets, or physical cash.

```typescript
interface LiquidFund extends BaseEntity {
  type: 'liquid_fund';
  name: string;              // e.g. "HDFC Savings", "Cash at home"
  institution?: string;
  balance: number;           // INR
  accountNumber?: string;    // Last 4 digits only (privacy)
  isEmergencyFund: boolean;  // Flag for dashboard highlighting
}
```

### 6.2 Fixed Deposits

```typescript
interface FixedDeposit extends BaseEntity {
  type: 'fixed_deposit';
  name: string;
  institution: string;
  principal: number;
  interestRate: number;      // Annual % (e.g. 7.5)
  startDate: string;         // ISO date
  maturityDate: string;
  maturityAmount?: number;   // Optional; auto-calculated if omitted
  autoRenew: boolean;
  taxDeductedAtSource: boolean;
}
```

**Computed fields (not stored):** daysToMaturity, projectedInterest, post-tax value estimate.

### 6.3 Holdings (Mutual Funds / Stocks)

```typescript
type HoldingInstrumentType = 'mutual_fund' | 'stock' | 'etf' | 'bond';

interface Holding extends BaseEntity {
  type: 'holding';
  instrumentType: HoldingInstrumentType;
  symbol: string;            // NSE/BSE ticker or MF scheme code
  name: string;
  quantity: number;
  averagePrice: number;      // Purchase price per unit
  currentPrice: number;      // Last known NAV/price (manual or imported)
  lastUpdated: string;       // When currentPrice was set
  broker: 'zerodha' | 'other';
  folioNumber?: string;
  sector?: string;
}

// Computed: investedValue, currentValue, gainLoss, gainLossPercent
```

### 6.4 Recurring Expenses (EMIs, Subscriptions, etc.)

```typescript
type RecurrenceFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

interface RecurringExpense extends BaseEntity {
  type: 'recurring_expense';
  name: string;              // e.g. "Home Loan EMI", "Netflix"
  category: RecurringCategory;
  amount: number;            // Per occurrence in INR
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;          // null = ongoing
  autoDebit: boolean;
  linkedLoanId?: string;     // Optional FK to Loan
}

type RecurringCategory =
  | 'emi'
  | 'subscription'
  | 'insurance_premium'
  | 'rent'
  | 'utility'
  | 'investment_sip'
  | 'other';
```

**Computed:** monthlyEquivalent, annualTotal, active status.

### 6.5 Loans

```typescript
type LoanType = 'home' | 'car' | 'personal' | 'education' | 'gold' | 'other';

interface Loan extends BaseEntity {
  type: 'loan';
  name: string;
  loanType: LoanType;
  lender: string;
  principal: number;         // Original loan amount
  outstandingBalance: number;
  interestRate: number;      // Annual %
  emiAmount: number;
  tenureMonths: number;
  startDate: string;
  linkedAssetId?: string;    // e.g. house asset
}
```

**Computed:** totalInterestRemaining, payoffDate estimate, LTV if linked asset exists.

### 6.6 LIC / Term Insurance

```typescript
type InsuranceType = 'term' | 'endowment' | 'ulip' | 'health' | 'other';

interface InsurancePolicy extends BaseEntity {
  type: 'insurance';
  policyName: string;
  insurer: string;           // e.g. "LIC"
  policyNumber?: string;
  insuranceType: InsuranceType;
  sumAssured: number;
  annualPremium: number;
  premiumFrequency: RecurrenceFrequency;
  startDate: string;
  maturityDate?: string;   // Term insurance may not have maturity
  nominees?: string;
  isActive: boolean;
}
```

### 6.7 PPF / PF (Retirement Accounts)

```typescript
type RetirementAccountType = 'ppf' | 'epf' | 'nps' | 'other';

interface RetirementAccount extends BaseEntity {
  type: 'retirement_account';
  accountType: RetirementAccountType;
  name: string;
  accountNumber?: string;
  currentBalance: number;
  annualContribution?: number;
  employerContribution?: number;  // EPF only
  interestRate?: number;            // PPF rate
  maturityDate?: string;          // PPF lock-in end
  startDate: string;
}
```

### 6.8 Physical / Illiquid Assets

```typescript
type AssetCategory = 'real_estate' | 'vehicle' | 'gold' | 'jewelry' | 'other';

interface Asset extends BaseEntity {
  type: 'asset';
  name: string;              // e.g. "Apartment - Whitefield"
  category: AssetCategory;
  purchasePrice: number;
  currentEstimatedValue: number;
  purchaseDate: string;
  lastValuationDate: string;
  linkedLoanId?: string;     // Outstanding home loan
  location?: string;
}

// Computed: appreciation, netEquity (value - linked loan outstanding)
```

### 6.9 User Profile & Settings (inside checkpoint)

```typescript
interface UserProfile {
  displayName?: string;
  baseCurrency: 'INR';       // Fixed for MVP; extensible later
  monthlyIncome?: number;    // For ratio calculations
  financialYearStart: 'april'; // India FY: April–March
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultDashboardPeriod: 'monthly' | 'yearly';
  showCents: boolean;
}
```

### 6.10 Root Application State

```typescript
interface FinanceState {
  schemaVersion: number;     // For migrations
  exportedAt: string;
  profile: UserProfile;
  settings: AppSettings;
  liquidFunds: LiquidFund[];
  fixedDeposits: FixedDeposit[];
  holdings: Holding[];
  recurringExpenses: RecurringExpense[];
  loans: Loan[];
  insurancePolicies: InsurancePolicy[];
  retirementAccounts: RetirementAccount[];
  assets: Asset[];
  snapshots?: MonthlySnapshot[];  // Optional: historical net worth snapshots
}

interface MonthlySnapshot {
  month: string;             // "2026-07"
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}
```

### Entity Relationship Overview

```
Asset ──────linkedLoanId──────► Loan
Loan ◄────linkedLoanId────── RecurringExpense (EMI)
Holding ────broker: zerodha───► Import source metadata
InsurancePolicy ──annualPremium──► included in recurring total (optional link)
```

---

## 7. Checkpoint File Specification

### File Format

- **Extension:** `.ftcheckpoint` or `.json` (recommend `.ftcheckpoint` to avoid accidental editing)
- **MIME type:** `application/json`
- **Encoding:** UTF-8
- **Max recommended size:** 5 MB (well above typical personal finance data)

### Example Structure

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-07-18T10:30:00.000Z",
  "appVersion": "1.0.0",
  "profile": {
    "displayName": "Ashwin",
    "baseCurrency": "INR",
    "monthlyIncome": 250000,
    "financialYearStart": "april"
  },
  "settings": {
    "theme": "system",
    "defaultDashboardPeriod": "monthly",
    "showCents": false
  },
  "liquidFunds": [],
  "fixedDeposits": [],
  "holdings": [],
  "recurringExpenses": [],
  "loans": [],
  "insurancePolicies": [],
  "retirementAccounts": [],
  "assets": [],
  "snapshots": []
}
```

### Schema Versioning & Migration

```typescript
// migrations/index.ts
const migrations: Record<number, (data: unknown) => FinanceState> = {
  // 1 → 2: example future migration
};
```

On load:
1. Parse JSON
2. Validate with Zod schema (lenient for unknown fields)
3. If `schemaVersion` < current, run sequential migrations
4. Reject files failing validation with user-friendly error

### Save Behavior

| Action | Behavior |
|--------|----------|
| **Save** | Serialize current state; prompt for file location (FS Access API) or download as `finance-checkpoint-YYYY-MM-DD.ftcheckpoint` |
| **Save As** | Always prompt for new filename |
| **Auto-suggest filename** | `finance-checkpoint-{date}.ftcheckpoint` |
| **Overwrite** | If user picks existing file via FS Access API, overwrite with confirmation |

### Load Behavior

1. User selects file via picker
2. Validate schema version and structure
3. If current session has unsaved changes → confirm discard
4. Hydrate store; reset dirty flag
5. Show success toast with summary: "Loaded 12 holdings, 3 loans, …"

### Optional: Session-Only Draft (Not Persisted to Cloud)

Use `sessionStorage` to recover from accidental tab close **within the same browser session only**. This is ephemeral and never synced — clearly labeled as "Session draft (not saved to file)."

---

## 8. Feature Modules

### 8.1 Checkpoint Manager (Global)

**Location:** Header toolbar — always accessible

| Button | Action |
|--------|--------|
| Load Checkpoint | Open file picker → hydrate state |
| Save Checkpoint | Write current state to file |
| Save As | Write to new file |
| New (Empty) | Reset to blank state (with confirmation) |
| Export Summary PDF (Phase 2) | Print-friendly dashboard snapshot |

**States:**
- No checkpoint loaded → show onboarding empty state
- Checkpoint loaded, saved → green "Saved" indicator
- Unsaved changes → amber "Unsaved changes" indicator

### 8.2 Liquid Funds Module

- CRUD list with sort by balance, institution
- Quick-add modal: name, balance, emergency fund toggle
- Dashboard contribution: total liquid, emergency fund subset

### 8.3 Fixed Deposits Module

- CRUD with maturity calendar view (Phase 2)
- Highlight FDs maturing in next 30/60/90 days
- Show total FD value and weighted average interest rate

### 8.4 Holdings Module

- CRUD for individual holdings
- Bulk import from Zerodha report (see Section 10)
- Table columns: name, qty, avg price, current price, P&L, % allocation
- Group by: instrument type, broker, sector

### 8.5 Recurring Expenses Module

- CRUD with category filters
- Toggle active/inactive without deleting
- Summary: total monthly equivalent, breakdown by category
- Link EMI entries to loan records

### 8.6 Loans Module

- CRUD with amortization summary (outstanding, EMI, rate)
- Total debt summary
- Debt-to-income ratio (if income set in profile)

### 8.7 Insurance Module

- CRUD for LIC/term and other policies
- Coverage adequacy indicator: sum assured vs recommended (e.g. 10× annual income rule of thumb — display as guidance, not advice)
- Annual premium total

### 8.8 PPF / PF Module

- CRUD for retirement accounts
- Total retirement corpus view
- Contribution tracking (optional annual contribution field)

### 8.9 Assets Module

- CRUD for real estate, vehicles, gold, etc.
- Net equity calculation when linked to loan
- Total illiquid assets vs liquid breakdown

---

## 9. Dashboard Design

The dashboard is the **primary decision-making surface**. It must answer five questions at a glance:

1. **What am I worth?** (Net worth)
2. **How liquid am I?** (Cash vs locked investments)
3. **What are my obligations?** (EMIs, loans, premiums)
4. **Am I protected?** (Insurance coverage)
5. **Where is my money allocated?** (Asset allocation)

### 9.1 Dashboard Layout (Desktop)

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Load] [Save]     Finance Tracker          ⚠ Unsaved    [Settings]   │
├──────────────┬─────────────────────────────────────────────────────────┤
│              │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  Dashboard   │  │Net Worth│ │ Liquid  │ │  Debt   │ │Monthly  │       │
│  Liquid      │  │ ₹2.4 Cr │ │ ₹12 L   │ │ ₹45 L   │ │ Outflow │       │
│  FDs         │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│  Holdings    │                                                         │
│  Recurring   │  ┌──────────────────────┐ ┌──────────────────────┐   │
│  Loans       │  │  Asset Allocation    │ │  Net Worth Trend     │   │
│  Insurance   │  │  (Donut Chart)       │ │  (Line Chart)        │   │
│  PPF/PF      │  └──────────────────────┘ └──────────────────────┘   │
│  Assets      │                                                         │
│              │  ┌──────────────────────┐ ┌──────────────────────┐   │
│              │  │  Upcoming Maturities │ │  Recurring Breakdown │   │
│              │  │  (FD, Insurance)     │ │  (Stacked Bar)       │   │
│              │  └──────────────────────┘ └──────────────────────┘   │
│              │                                                         │
│              │  ┌──────────────────────────────────────────────────┐  │
│              │  │  Key Ratios & Insights (auto-generated)         │  │
│              │  │  • Liquidity ratio: 18%                         │  │
│              │  │  • EMI burden: 32% of income                    │  │
│              │  │  • Insurance coverage: 8× income ✓              │  │
│              │  │  • FD maturing in 45 days: ₹5L @ SBI           │  │
│              │  └──────────────────────────────────────────────────┘  │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### 9.2 Dashboard Layout (Mobile)

- Bottom tab navigation: Dashboard | Add | Data | Settings
- KPI cards: horizontal scroll
- Charts: stacked vertically, touch-friendly
- Collapsible sections for insights

### 9.3 KPI Definitions

| KPI | Formula | Decision Use |
|-----|---------|--------------|
| **Total Assets** | Liquid + FD + Holdings current value + Retirement + Assets estimated value | Wealth tracking |
| **Total Liabilities** | Sum of loan outstanding balances | Debt awareness |
| **Net Worth** | Total Assets − Total Liabilities | Primary wealth metric |
| **Liquid Assets** | Sum of liquid fund balances | Emergency readiness |
| **Liquidity Ratio** | Liquid Assets / Total Assets × 100 | Should typically be 10–20% |
| **Invested Assets** | Holdings + FD + Retirement | Long-term wealth |
| **Monthly Outflow** | Sum of recurring expenses (monthly equivalent) | Budget pressure |
| **EMI Burden** | EMI category monthly total / monthly income × 100 | Affordability (keep < 40%) |
| **Debt-to-Asset Ratio** | Total Liabilities / Total Assets × 100 | Leverage risk |
| **Insurance Coverage Ratio** | Term sum assured / annual income | Under/over insurance check |
| **Emergency Fund Months** | Liquid (emergency flagged) / monthly outflow | Runway (target: 6 months) |
| **Allocation: Equity** | Holdings (MF+stock) / Total Assets | Risk profile |
| **Unrealized P&L** | Sum(current − invested) across holdings | Market performance |

### 9.4 Auto-Generated Insights (Rule Engine)

Simple client-side rules — no AI required for MVP:

```typescript
interface Insight {
  severity: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  actionRoute?: string;  // Deep link to relevant module
}

// Example rules:
// - EMI burden > 40% → warning
// - Emergency fund < 3 months → warning
// - FD maturing within 30 days → info with amount
// - Insurance coverage < 5× income → warning
// - Net worth increased since last snapshot → success
```

### 9.5 Charts

| Chart | Type | Data Source |
|-------|------|-------------|
| Asset Allocation | Donut | Group by: Liquid, FD, Equity, Retirement, Real Estate, Other |
| Net Worth Trend | Line | `snapshots[]` — user can "Record snapshot" monthly |
| Recurring Breakdown | Horizontal bar | Group recurring by category |
| Holdings P&L | Bar | Top 10 holdings by absolute P&L |
| Debt Composition | Pie | Group loans by type |
| Maturity Timeline | Timeline (Phase 2) | FD maturity dates + insurance renewal |

### 9.6 "Record Snapshot" Action

Monthly button on dashboard:
- Captures current total assets, liabilities, net worth
- Appends to `snapshots[]` in state (deduplicates same month)
- Enables net worth trend chart
- Prompt user to save checkpoint after recording

---

## 10. Zerodha / Holdings Import Strategy

### Phase 1 (MVP): File Upload

Zerodha provides downloadable reports (CSV/XLSX) from Console → Reports. The app will support:

| Report Type | Expected Columns | Mapping |
|-------------|------------------|---------|
| Holdings / P&L | Symbol, ISIN, Qty, Avg Price, LTP, etc. | → `Holding` entities |
| Mutual Fund holdings | Scheme name, Folio, Units, NAV | → `Holding` with `instrumentType: mutual_fund` |
| Tax P&L / Annual | Buy date, Sell date, P&L | Phase 2 — not needed for net worth |

**Import flow:**

```
Holdings page → Import → Select file → Preview parsed rows
→ User confirms mapping → Merge or Replace existing Zerodha holdings
→ Mark broker='zerodha', set lastUpdated → Save checkpoint
```

**Merge strategy:**
- Match on `symbol` + `broker`
- Update quantity, currentPrice, averagePrice if exists
- Add new rows for new symbols
- Option: "Replace all Zerodha holdings" vs "Merge"

**Parser implementation:**
- Detect file type (CSV vs XLSX)
- Auto-detect Zerodha format by header row matching
- Show validation errors per row (skip invalid, import valid)
- Store `importMetadata` in checkpoint (source file name, import date) — optional

### Phase 2 (Optional): Zerodha Kite Connect API

> **Caveat:** Kite Connect requires a paid API subscription (~₹500/month) and OAuth flow. It also requires a **backend** for secure API key storage — which conflicts with pure static hosting.

**If pursued later, architecture options:**

| Option | Pros | Cons |
|--------|------|------|
| A. Manual API token paste (session only) | No backend | Token in browser memory; expires daily; security risk |
| B. Separate local helper (Electron/Tauri) | Secure local API | Not pure web |
| C. User-hosted micro-backend | Proper OAuth | Violates "GitHub Pages only" simplicity |

**Recommendation:** Stick with file upload for MVP. Revisit only if upload friction is too high.

---

## 11. UI/UX Principles & Information Architecture

### Design Principles

1. **Privacy visible** — Persistent "Data stays on your device" badge in footer
2. **Progressive disclosure** — Dashboard summary first; details on drill-down
3. **Forgiving editing** — No auto-save to file; explicit save gives user control
4. **INR-native** — `₹1,23,456` formatting (Indian numbering system)
5. **Mobile-first forms** — Large tap targets, numeric keyboards for amounts
6. **Empty states that teach** — Each module shows what to add and why it matters

### Navigation Structure

```
/ (Dashboard)
/liquid-funds
/fixed-deposits
/holdings
  /holdings/import
/recurring
/loans
/insurance
/retirement
/assets
/settings
```

### Color Semantics

| Color | Meaning |
|-------|---------|
| Green | Positive P&L, healthy ratio, paid-off |
| Red | Liability, negative P&L, warning insight |
| Amber | Unsaved changes, approaching maturity |
| Blue | Neutral info, liquid assets |

### Accessibility

- WCAG 2.1 AA contrast ratios
- All charts have tabular data alternative
- Keyboard navigation for forms and modals
- Screen reader labels on KPI cards

---

## 12. Security & Privacy

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Data exfiltration to server | No backend; no analytics with PII; static assets only |
| Checkpoint file left on shared computer | User responsibility; optional future: encrypt checkpoint with password (Phase 2) |
| XSS via malicious checkpoint file | Validate all loaded JSON with Zod; sanitize rendered strings |
| Supply chain attack | Lock dependencies; Dependabot; npm audit in CI |
| Accidental commit of checkpoint to GitHub | `.gitignore` includes `*.ftcheckpoint`; README warning |

### Privacy Checklist

- [ ] No `fetch()` to third-party APIs with financial data
- [ ] No localStorage persistence of financial data (only sessionStorage for draft recovery)
- [ ] No Google Analytics with default config (if analytics added, use privacy-friendly, no PII)
- [ ] Checkpoint file contains all data in plaintext JSON — document this clearly for users

### Optional Phase 2: Encrypted Checkpoints

```
User password → PBKDF2 → AES-256-GCM encrypt JSON → .ftcheckpoint.enc
```

Requires password on every load. Significant UX tradeoff — only if user requests.

---

## 13. GitHub Pages Deployment

### Repository Setup

```
github.com/{username}/finance_tracker
├── .github/workflows/deploy.yml
├── public/
├── src/
├── index.html
├── vite.config.ts
└── package.json
```

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  base: '/finance_tracker/',  // Match repo name for project pages
  // ...
});
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

### Repository Settings

1. Settings → Pages → Source: GitHub Actions
2. Enforce HTTPS
3. Custom domain (optional): `finance.example.com`

### README Must Include

- Live demo URL
- "Your data never leaves your browser" disclaimer
- How to save/load checkpoints
- Supported browsers
- Zerodha import instructions with screenshots

---

## 14. Project Structure

```
finance_tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   └── manifest.json          # PWA manifest (Phase 2)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   └── index.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx
│   │   │   ├── AssetAllocationChart.tsx
│   │   │   ├── NetWorthChart.tsx
│   │   │   ├── InsightsPanel.tsx
│   │   │   └── UpcomingMaturities.tsx
│   │   ├── checkpoint/
│   │   │   ├── CheckpointToolbar.tsx
│   │   │   └── UnsavedChangesDialog.tsx
│   │   ├── forms/
│   │   │   ├── LiquidFundForm.tsx
│   │   │   ├── FixedDepositForm.tsx
│   │   │   ├── HoldingForm.tsx
│   │   │   ├── RecurringExpenseForm.tsx
│   │   │   ├── LoanForm.tsx
│   │   │   ├── InsuranceForm.tsx
│   │   │   ├── RetirementForm.tsx
│   │   │   └── AssetForm.tsx
│   │   └── ui/                  # shadcn components
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── LiquidFundsPage.tsx
│   │   ├── FixedDepositsPage.tsx
│   │   ├── HoldingsPage.tsx
│   │   ├── HoldingsImportPage.tsx
│   │   ├── RecurringPage.tsx
│   │   ├── LoansPage.tsx
│   │   ├── InsurancePage.tsx
│   │   ├── RetirementPage.tsx
│   │   ├── AssetsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   ├── checkpoint/
│   │   │   ├── serialize.ts
│   │   │   ├── deserialize.ts
│   │   │   ├── migrate.ts
│   │   │   └── fileAccess.ts
│   │   ├── analytics/
│   │   │   ├── netWorth.ts
│   │   │   ├── ratios.ts
│   │   │   ├── insights.ts
│   │   │   └── allocations.ts
│   │   └── import/
│   │       ├── zerodhaCsv.ts
│   │       ├── zerodhaXlsx.ts
│   │       └── holdingsMerger.ts
│   ├── store/
│   │   └── financeStore.ts
│   ├── schemas/
│   │   ├── entities.ts          # Zod schemas
│   │   └── checkpoint.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── currency.ts          # INR formatting
│   │   ├── dates.ts
│   │   └── ids.ts               # UUID generation
│   ├── hooks/
│   │   ├── useCheckpoint.ts
│   │   ├── useDirtyGuard.ts
│   │   └── useAnalytics.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── analytics/
│   ├── checkpoint/
│   └── import/
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── plan.md                      # This document
└── README.md
```

---

## 15. Development Phases

### Phase 0 — Project Bootstrap (Week 1)

**Deliverables:**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind + shadcn/ui
- [ ] Set up HashRouter with placeholder pages
- [ ] GitHub Actions deploy pipeline
- [ ] Define all TypeScript types and Zod schemas
- [ ] Implement Zustand store with empty initial state
- [ ] INR currency formatter utility

**Exit criteria:** App deploys to GitHub Pages with navigation shell; no data features yet.

---

### Phase 1 — Checkpoint System (Week 2)

**Deliverables:**
- [ ] `CheckpointService`: serialize / deserialize
- [ ] File load via `<input type="file">`
- [ ] File save via download + FS Access API (where supported)
- [ ] Schema validation on load
- [ ] Dirty flag + `beforeunload` guard
- [ ] Header toolbar: Load, Save, Save As, New
- [ ] Empty state onboarding screen

**Exit criteria:** User can save empty checkpoint, reload it, and see consistent state.

---

### Phase 2 — Core CRUD Modules (Weeks 3–4)

**Deliverables (each module: list view + add/edit modal + delete confirm):**
- [ ] Liquid Funds
- [ ] Fixed Deposits
- [ ] Loans
- [ ] Recurring Expenses
- [ ] Insurance
- [ ] PPF / PF
- [ ] Assets
- [ ] Settings (profile: name, monthly income, theme)

**Exit criteria:** All manual entry types work; data persists through checkpoint save/load.

---

### Phase 3 — Holdings & Zerodha Import (Week 5)

**Deliverables:**
- [ ] Holdings CRUD
- [ ] CSV parser for Zerodha holdings export
- [ ] XLSX parser (if Zerodha provides xlsx)
- [ ] Import preview UI with merge/replace options
- [ ] P&L columns (invested, current, gain/loss)

**Exit criteria:** User can upload a Zerodha report and see holdings on dashboard.

---

### Phase 4 — Analytics Engine & Dashboard (Week 6)

**Deliverables:**
- [ ] `analytics/` service: all KPI calculations
- [ ] Insights rule engine
- [ ] Dashboard KPI cards
- [ ] Asset allocation donut chart
- [ ] Recurring expense breakdown chart
- [ ] Holdings P&L bar chart
- [ ] Upcoming FD maturities widget
- [ ] "Record snapshot" for net worth trend
- [ ] Net worth trend line chart

**Exit criteria:** Dashboard fully functional with real data; insights generate correctly.

---

### Phase 5 — Polish & Mobile (Week 7)

**Deliverables:**
- [ ] Responsive layout for all pages
- [ ] Mobile bottom navigation
- [ ] Touch-friendly charts
- [ ] Loading states, error boundaries
- [ ] Empty states for all modules
- [ ] README with usage documentation
- [ ] Sample checkpoint file for demo (`public/sample.ftcheckpoint`)

**Exit criteria:** Usable on iPhone and Android Chrome; Lighthouse mobile score > 85.

---

### Phase 6 — Testing & Hardening (Week 8)

**Deliverables:**
- [ ] Unit tests: analytics calculations (100% coverage on ratios)
- [ ] Unit tests: checkpoint serialize/deserialize round-trip
- [ ] Unit tests: Zerodha CSV parser with fixture files
- [ ] Component tests: Dashboard renders KPIs
- [ ] Manual test checklist (see Section 16)
- [ ] `.gitignore` for checkpoint files
- [ ] Security review: no network leaks

**Exit criteria:** CI passes; manual checklist complete; v1.0 release tag.

---

## 16. Testing Strategy

### Unit Tests (Vitest)

| Area | Test Cases |
|------|------------|
| `netWorth.ts` | Empty state, mixed assets/liabilities, negative net worth |
| `ratios.ts` | Zero income (no division by zero), zero assets |
| `insights.ts` | Each rule triggers at correct threshold |
| `serialize/deserialize` | Round-trip equality; schema version migration |
| `zerodhaCsv.ts` | Valid file, missing columns, empty file, duplicate symbols |
| `currency.ts` | ₹ formatting for lakhs/crores |

### Component Tests

- Dashboard renders 4 KPI cards with formatted INR values
- Checkpoint toolbar shows "Unsaved" when dirty
- Form validation rejects negative amounts

### Manual Test Checklist

- [ ] Load checkpoint on Chrome desktop
- [ ] Load checkpoint on mobile Safari (iOS)
- [ ] Save checkpoint and re-open from file manager
- [ ] Add each entity type; verify dashboard updates
- [ ] Import Zerodha CSV; verify merge
- [ ] Unsaved changes warning on tab close
- [ ] Load new checkpoint with unsaved changes → confirmation dialog
- [ ] Empty state → add data → save → reload
- [ ] Dark mode toggle
- [ ] Offline use after initial page load (GitHub Pages cached)

### Fixture Files

```
tests/fixtures/
├── zerodha-holdings.csv
├── zerodha-holdings.xlsx
├── sample-checkpoint-v1.ftcheckpoint
└── invalid-checkpoint.json
```

---

## 17. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS Safari file save UX poor | High | Medium | Fallback to download; clear instructions in README |
| Zerodha changes report format | Medium | Medium | Versioned parsers; manual column mapping UI (Phase 2) |
| User forgets to save checkpoint | High | High | Prominent unsaved indicator; session draft recovery |
| Large checkpoint file slow to parse | Low | Low | JSON parse is fast <5MB; show loading spinner |
| GitHub Pages URL confusion (base path) | Medium | Low | HashRouter; test deploy early in Phase 0 |
| Stale holding prices | High | Medium | Show `lastUpdated` on holdings; dashboard "data freshness" indicator |
| User commits checkpoint to public repo | Medium | High | `.gitignore`; README warning; no checkpoint in repo |

---

## 18. Future Enhancements (Post-MVP)

| Feature | Priority | Notes |
|---------|----------|-------|
| Password-encrypted checkpoints | High | AES-256 client-side |
| PWA installable app | High | vite-plugin-pwa |
| Goals & targets (e.g. "₹1Cr by 2030") | Medium | Projection charts |
| SIP tracker linked to holdings | Medium | Recurring → holding link |
| FD maturity calendar | Medium | iCal export |
| Multi-currency support | Low | USD assets |
| PDF export of dashboard | Medium | html2canvas + jsPDF |
| Historical price import (manual CSV) | Medium | Net worth over time without manual snapshots |
| Budget vs actual (monthly) | Medium | Requires expense tracking expansion |
| Zerodha Kite OAuth (local helper) | Low | Only if file import insufficient |
| Shared family checkpoint (merge) | Low | Complex; conflict resolution needed |
| AI insights (local LLM) | Low | Privacy-preserving; experimental |

---

## 19. Open Questions

Resolve before or during Phase 1:

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| Q1 | Default checkpoint extension? | `.json` vs `.ftcheckpoint` | `.ftcheckpoint` — distinctive, avoids accidental edit |
| Q2 | Include sample data in repo? | Yes (anonymized) vs No | Yes — `public/demo.ftcheckpoint` for first-time users |
| Q3 | Record snapshots automatically on save? | Auto vs manual button | Manual button — user controls history |
| Q4 | Link insurance premium to recurring expenses automatically? | Auto-create vs manual | Suggest link on insurance create; user confirms |
| Q5 | Dark mode default? | System preference | `system` default |
| Q6 | Repo visibility? | Public vs private | Public repo (code only); checkpoint files stay local |
| Q7 | Income field — gross or net? | Gross vs net take-home | Net take-home (more accurate for EMI ratio) — label clearly |

---

## 20. Appendix

### A. Indian Number Formatting

```typescript
// ₹1,23,45,678.90 — Indian grouping
function formatINR(amount: number, showCents = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}
```

### B. Recurring Expense Monthly Equivalent

```typescript
function toMonthlyEquivalent(amount: number, frequency: RecurrenceFrequency): number {
  const factors: Record<RecurrenceFrequency, number> = {
    monthly: 1,
    quarterly: 1 / 3,
    half_yearly: 1 / 6,
    yearly: 1 / 12,
  };
  return amount * factors[frequency];
}
```

### C. FD Maturity Amount (Simple Interest — MVP)

```typescript
// For MVP use simple interest; compound interest upgrade in Phase 2
function estimateMaturityAmount(
  principal: number,
  rate: number,
  startDate: Date,
  maturityDate: Date
): number {
  const years = (maturityDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return principal * (1 + (rate / 100) * years);
}
```

### D. Zerodha Console Report Locations (Reference)

> Verify against current Zerodha Console UI — paths may change.

- **Equity holdings:** Console → Portfolio → Holdings → Download
- **Mutual funds:** Console → Mutual Funds → Holdings
- **P&L:** Console → Reports → P&L

Parser should be tolerant of column name variations (`Avg. Price`, `Average Price`, etc.).

### E. Sample Insight Rules (Full List for MVP)

| Rule ID | Condition | Severity | Message Template |
|---------|-----------|----------|------------------|
| INS-01 | term coverage < 5× annual income | warning | Term insurance covers {x}× income; consider 10× |
| INS-02 | term coverage ≥ 10× annual income | success | Term insurance coverage is adequate |
| LIQ-01 | emergency months < 3 | warning | Emergency fund covers only {n} months of expenses |
| LIQ-02 | emergency months ≥ 6 | success | Emergency fund covers {n} months |
| EMI-01 | EMI burden > 40% | warning | EMIs consume {p}% of monthly income |
| EMI-02 | EMI burden ≤ 25% | success | EMI burden is healthy at {p}% |
| FD-01 | FD maturing within 30 days | info | {name} matures on {date}: {amount} |
| DEBT-01 | debt-to-asset > 50% | warning | Debt is {p}% of total assets |
| HOLD-01 | holding price not updated in 90 days | info | {n} holdings have stale prices (last updated > 90 days ago) |
| NW-01 | net worth decreased vs last snapshot | warning | Net worth down {amount} since {month} |

### F. Glossary

| Term | Definition |
|------|------------|
| Checkpoint | JSON file containing complete app state |
| Liquid assets | Cash and bank balances readily accessible |
| Net worth | Total assets minus total liabilities |
| EMI | Equated Monthly Installment |
| PPF | Public Provident Fund |
| PF/EPF | Employee Provident Fund |
| NAV | Net Asset Value (mutual fund unit price) |
| LTP | Last Traded Price (stocks) |

---

## Next Steps

1. **Review this plan** — resolve Open Questions (Section 19)
2. **Phase 0 kickoff** — scaffold repo, deploy empty shell to GitHub Pages
3. **Build checkpoint system first** — it is the foundation for all other features
4. **Iterate module by module** — following phase order in Section 15

---

*This document is the single source of truth for v1.0 development. Update `schemaVersion` in code and bump the plan version when making architectural changes.*
