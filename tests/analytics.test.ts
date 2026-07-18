import { describe, it, expect } from 'vitest';
import { createEmptyState } from '@/schemas/checkpoint';
import {
  netWorth,
  totalLiquidAssets,
  liquidityRatio,
  recordSnapshot,
  dedupeSnapshots,
  normalizeSnapshotMonth,
} from '@/services/analytics/netWorth';
import { totalPnLSummary, spendAnalysis } from '@/services/analytics/portfolioAnalytics';
import { toMonthlyEquivalent } from '@/utils/currency';
import { serializeState, deserializeState } from '@/services/checkpoint/serialize';
import { parseZerodhaCsv, parseZerodhaXlsx, parseZerodhaXlsxDetailed } from '@/services/import/zerodhaCsv';
import { parseCoinDcxCsv } from '@/services/import/coindcxCsv';
import { generateId, nowIso } from '@/utils/ids';
import * as XLSX from 'xlsx';

describe('analytics', () => {
  it('calculates net worth', () => {
    const state = createEmptyState();
    state.liquidFunds.push({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'liquid_fund',
      name: 'Savings',
      balance: 100000,
      isEmergencyFund: true,
    });
    state.loans.push({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'loan',
      name: 'Home',
      loanType: 'home',
      lender: 'Bank',
      principal: 5000000,
      outstandingBalance: 2000000,
      interestRate: 8.5,
      emiAmount: 45000,
      tenureMonths: 240,
      startDate: '2020-01-01',
    });
    expect(totalLiquidAssets(state)).toBe(100000);
    expect(netWorth(state)).toBe(-1900000);
  });

  it('computes monthly equivalent', () => {
    expect(toMonthlyEquivalent(12000, 'yearly')).toBeCloseTo(1000);
  });

  it('handles zero assets for liquidity ratio', () => {
    expect(liquidityRatio(createEmptyState())).toBe(0);
  });

  it('normalizes snapshot month keys', () => {
    expect(normalizeSnapshotMonth('2026-7')).toBe('2026-07');
    expect(normalizeSnapshotMonth('2026-07-18')).toBe('2026-07');
  });

  it('dedupes snapshots keeping the latest per month', () => {
    const deduped = dedupeSnapshots([
      { month: '2026-01', totalAssets: 100, totalLiabilities: 0, netWorth: 100 },
      { month: '2026-01', totalAssets: 200, totalLiabilities: 0, netWorth: 200 },
      { month: '2026-2', totalAssets: 300, totalLiabilities: 0, netWorth: 300 },
    ]);
    expect(deduped).toHaveLength(2);
    expect(deduped.find((s) => s.month === '2026-01')?.netWorth).toBe(200);
    expect(deduped.find((s) => s.month === '2026-02')?.netWorth).toBe(300);
  });

  it('recordSnapshot replaces same-month entries with the latest values', () => {
    const state = createEmptyState();
    state.snapshots = [
      { month: '2026-07', totalAssets: 100, totalLiabilities: 0, netWorth: 100 },
      { month: '2026-07', totalAssets: 150, totalLiabilities: 0, netWorth: 150 },
    ];
    state.liquidFunds.push({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'liquid_fund',
      name: 'Savings',
      balance: 500000,
      isEmergencyFund: false,
    });

    const currentMonth = normalizeSnapshotMonth(new Date().toISOString().slice(0, 7));
    const updated = recordSnapshot(state);
    const currentMonthSnapshots = updated.snapshots.filter((s) => s.month === currentMonth);

    expect(currentMonthSnapshots).toHaveLength(1);
    expect(currentMonthSnapshots[0]!.netWorth).toBe(netWorth(state));
    expect(updated.snapshots.filter((s) => s.month === '2026-07').length).toBeLessThanOrEqual(1);
  });
});

describe('checkpoint', () => {
  it('round-trips serialize/deserialize', () => {
    const state = createEmptyState();
    state.profile.displayName = 'Test';
    const json = serializeState(state);
    const loaded = deserializeState(json);
    expect(loaded.profile.displayName).toBe('Test');
    expect(loaded.schemaVersion).toBe(2);
  });
});

describe('zerodha import', () => {
  it('parses CSV with standard headers', () => {
    const csv = `Symbol,Qty,Average Price,LTP,Instrument
RELIANCE,10,2500,2600,RELIANCE INDUSTRIES`;
    const rows = parseZerodhaCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.symbol).toBe('RELIANCE');
    expect(rows[0]!.quantity).toBe(10);
  });

  it('parses XLSX with preamble rows (Zerodha Console format)', () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Holdings Report'],
      ['As on', '31-Mar-2025'],
      [],
      [
        'Trading Symbol',
        'Company Name',
        'ISIN',
        'Quantity',
        'Average Price',
        'Previous Closing Price',
      ],
      ['RELIANCE', 'Reliance Industries Ltd', 'INE002A01018', 10, 2500.5, 2600.75],
      ['TCS', 'Tata Consultancy Services', 'INE467B01029', 5, 3400, 3550],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Holdings');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

    const rows = parseZerodhaXlsx(buffer);
    expect(rows).toHaveLength(2);
    expect(rows[0]!.symbol).toBe('RELIANCE');
    expect(rows[0]!.quantity).toBe(10);
    expect(rows[0]!.currentPrice).toBeCloseTo(2600.75);
  });

  it('parses all sheets in a multi-sheet XLSX', () => {
    const equity = XLSX.utils.aoa_to_sheet([
      ['Trading Symbol', 'Company Name', 'Quantity', 'Average Price', 'Previous Closing Price'],
      ['RELIANCE', 'Reliance Industries Ltd', 10, 2500, 2600],
    ]);
    const mf = XLSX.utils.aoa_to_sheet([
      ['Scheme Name', 'Units', 'Average Price', 'NAV'],
      ['Parag Parikh Flexi Cap Fund', 100, 65.5, 72.3],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, equity, 'Equity');
    XLSX.utils.book_append_sheet(wb, mf, 'Mutual Funds');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

    const result = parseZerodhaXlsxDetailed(buffer);
    expect(result.sheetsParsed).toBe(2);
    expect(result.sheetNames).toEqual(['Equity', 'Mutual Funds']);
    expect(result.rows.length).toBe(2);
    expect(result.rows.some((r) => r.symbol === 'RELIANCE')).toBe(true);
    expect(result.rows.some((r) => r.instrumentType === 'mutual_fund')).toBe(true);
  });

  it('parses XLSX with Avg. cost and Qty columns', () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Instrument', 'Qty', 'Avg. cost', 'LTP'],
      ['INFY', 20, 1500, 1620],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

    const rows = parseZerodhaXlsx(buffer);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.symbol).toBe('INFY');
    expect(rows[0]!.averagePrice).toBe(1500);
  });
});

describe('coindcx import', () => {
  it('parses order history CSV', () => {
    const csv = `Market,Side,Total Quantity,Price per unit
BTCINR,Buy,0.1,4500000
BTCINR,Buy,0.05,5000000
ETHINR,Buy,1.2,180000`;
    const rows = parseCoinDcxCsv(csv, true);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const btc = rows.find((r) => r.symbol === 'BTC');
    expect(btc?.quantity).toBeCloseTo(0.15);
  });

  it('parses holdings CSV', () => {
    const csv = `Coin,Quantity,Current Price,Avg Buy Price
BTC,0.05,6200000,4500000`;
    const rows = parseCoinDcxCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.symbol).toBe('BTC');
  });
});

describe('portfolio analytics', () => {
  it('computes P&L breakdown', () => {
    const state = createEmptyState();
    state.holdings.push({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'holding',
      instrumentType: 'stock',
      symbol: 'TCS',
      name: 'TCS',
      quantity: 10,
      averagePrice: 3000,
      currentPrice: 3500,
      lastUpdated: nowIso(),
      broker: 'zerodha',
    });
    const summary = totalPnLSummary(state);
    expect(summary.totalPnl).toBe(5000);
    expect(summary.breakdown.length).toBeGreaterThan(0);
  });

  it('computes spend analysis with savings rate', () => {
    const state = createEmptyState();
    state.profile.monthlyIncome = 100000;
    state.recurringExpenses.push({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'recurring_expense',
      name: 'EMI',
      category: 'emi',
      amount: 30000,
      frequency: 'monthly',
      startDate: '2024-01-01',
      autoDebit: true,
      isActive: true,
    });
    const spend = spendAnalysis(state);
    expect(spend.totalMonthly).toBe(30000);
    expect(spend.savingsRate).toBeCloseTo(70);
  });
});

describe('checkpoint migration', () => {
  it('migrates v1 checkpoint without cryptoHoldings', () => {
    const state = createEmptyState();
    const { cryptoHoldings, ...withoutCrypto } = state;
    const v1 = { ...withoutCrypto, schemaVersion: 1 };
    const json = JSON.stringify(v1);
    const loaded = deserializeState(json);
    expect(loaded.cryptoHoldings).toEqual([]);
    expect(loaded.schemaVersion).toBe(2);
  });
});
