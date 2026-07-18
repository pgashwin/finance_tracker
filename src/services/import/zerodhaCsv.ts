import type { Holding } from '@/types';
import { generateId, nowIso } from '@/utils/ids';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedHoldingRow {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  instrumentType: Holding['instrumentType'];
}

export interface ZerodhaParseResult {
  rows: ParsedHoldingRow[];
  headerRow?: number;
  sheetName?: string;
  sheetNames?: string[];
  sheetsParsed?: number;
  detectedHeaders?: string[];
}

const SYMBOL_COLUMNS = [
  'tradingsymbol',
  'trading symbol',
  'symbol',
  'scrip',
  'ticker',
  'schemecode',
  'scheme code',
  'isin',
  'instrument',
];

const NAME_COLUMNS = [
  'companyname',
  'company name',
  'name',
  'schemename',
  'scheme name',
  'instrument name',
  'security name',
  'description',
];

const QTY_COLUMNS = [
  'quantity',
  'qty',
  'units',
  'holdingqty',
  'holding qty',
  'openqty',
  'open qty',
  'totalqty',
  'total quantity',
  'quantityheld',
  'quantity held',
  'closing quantity',
];

const AVG_COLUMNS = [
  'averageprice',
  'average price',
  'avgprice',
  'avg price',
  'avgcost',
  'avg cost',
  'averagecost',
  'average cost',
  'buyavg',
  'buy avg',
  'buyaverage',
  'buy average',
  'costprice',
  'cost price',
];

const LTP_COLUMNS = [
  'previous closing price',
  'previous close',
  'prevclose',
  'last traded price',
  'ltp',
  'lastprice',
  'last price',
  'closeprice',
  'close price',
  'closingprice',
  'closing price',
  'currentprice',
  'current price',
  'marketprice',
  'market price',
  'nav',
];

const SKIP_SYMBOLS = new Set(['total', 'grand total', 'summary', '']);

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[.\s_]+/g, '');
}

function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalizeHeader);

  for (const c of candidates) {
    const idx = normalized.indexOf(normalizeHeader(c));
    if (idx >= 0) return idx;
  }

  for (const c of candidates) {
    const nc = normalizeHeader(c);
    if (nc.length < 5) continue;
    const idx = normalized.findIndex((h) => h.includes(nc));
    if (idx >= 0) return idx;
  }

  return -1;
}

function cellToString(val: unknown): string {
  if (val == null || val === '') return '';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return val.trim();
  if (val instanceof Date) return val.toISOString().split('T')[0]!;
  return String(val).trim();
}

function rowToStrings(row: unknown[]): string[] {
  return row.map(cellToString);
}

function parseNumber(val: unknown): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const str = cellToString(val);
  if (!str) return 0;
  const cleaned = str.replace(/[,₹\s]/g, '').replace(/[()]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function isHeaderRow(headers: string[]): boolean {
  const hasQty = findColumn(headers, QTY_COLUMNS) >= 0;
  const hasSymbolOrName =
    findColumn(headers, SYMBOL_COLUMNS) >= 0 || findColumn(headers, NAME_COLUMNS) >= 0;
  return hasQty && hasSymbolOrName;
}

function findHeaderRowIndex(data: unknown[][]): number {
  for (let i = 0; i < Math.min(data.length, 25); i++) {
    const row = rowToStrings(data[i] ?? []);
    if (row.filter(Boolean).length < 3) continue;
    if (isHeaderRow(row)) return i;
  }
  return 0;
}

function inferInstrumentType(name: string, headers: string[]): Holding['instrumentType'] {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('etf')) return 'etf';
  if (
    nameLower.includes('fund') ||
    headers.some((h) => {
      const n = normalizeHeader(h);
      return n.includes('nav') || n.includes('scheme');
    })
  ) {
    return 'mutual_fund';
  }
  return 'stock';
}

function rowToHolding(row: string[], headers: string[]): ParsedHoldingRow | null {
  const symbolIdx = findColumn(headers, SYMBOL_COLUMNS);
  const nameIdx = findColumn(headers, NAME_COLUMNS);
  const qtyIdx = findColumn(headers, QTY_COLUMNS);
  const avgIdx = findColumn(headers, AVG_COLUMNS);
  const ltpIdx = findColumn(headers, LTP_COLUMNS);

  if (qtyIdx < 0) return null;
  if (symbolIdx < 0 && nameIdx < 0) return null;

  let symbol = symbolIdx >= 0 ? (row[symbolIdx] ?? '').trim() : '';
  let name = nameIdx >= 0 ? (row[nameIdx] ?? '').trim() : '';

  if (!symbol && name) symbol = name.split(' ')[0]!.toUpperCase();
  if (!name) name = symbol;

  if (!symbol || SKIP_SYMBOLS.has(symbol.toLowerCase())) return null;

  const quantity = parseNumber(row[qtyIdx]);
  if (quantity <= 0) return null;

  const averagePrice = avgIdx >= 0 ? parseNumber(row[avgIdx]) : 0;
  let currentPrice = ltpIdx >= 0 ? parseNumber(row[ltpIdx]) : 0;
  if (currentPrice === 0) currentPrice = averagePrice;

  return {
    symbol: symbol.toUpperCase(),
    name,
    quantity,
    averagePrice,
    currentPrice,
    instrumentType: inferInstrumentType(name, headers),
  };
}

export function parseZerodhaSheetData(data: unknown[][]): ZerodhaParseResult {
  if (!data.length) return { rows: [] };

  const headerIdx = findHeaderRowIndex(data);
  const headers = rowToStrings(data[headerIdx] ?? []);
  const rows: ParsedHoldingRow[] = [];

  for (let i = headerIdx + 1; i < data.length; i++) {
    const raw = data[i] ?? [];
    if (!raw.some((c) => cellToString(c))) continue;
    const row = rowToStrings(raw);
    const parsed = rowToHolding(row, headers);
    if (parsed) rows.push(parsed);
  }

  return {
    rows,
    headerRow: headerIdx,
    detectedHeaders: headers.filter(Boolean),
  };
}

export function parseZerodhaCsv(text: string): ParsedHoldingRow[] {
  const result = Papa.parse<unknown[]>(text, { skipEmptyLines: true });
  if (!result.data.length) return [];
  return parseZerodhaSheetData(result.data).rows;
}

export function parseZerodhaXlsx(buffer: ArrayBuffer): ParsedHoldingRow[] {
  return parseZerodhaXlsxDetailed(buffer).rows;
}

function dedupeParsedRows(rows: ParsedHoldingRow[]): ParsedHoldingRow[] {
  const map = new Map<string, ParsedHoldingRow>();
  for (const row of rows) {
    map.set(`${row.instrumentType}:${row.symbol}`, row);
  }
  return Array.from(map.values());
}

function parseWorkbookSheet(
  sheet: XLSX.WorkSheet,
  sheetName: string,
): { sheetName: string; result: ZerodhaParseResult } {
  let data = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });
  let result = parseZerodhaSheetData(data);

  if (result.rows.length === 0) {
    data = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      raw: true,
    });
    result = parseZerodhaSheetData(data);
  }

  return { sheetName, result };
}

export function parseZerodhaXlsxDetailed(buffer: ArrayBuffer): ZerodhaParseResult {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const parsedSheets: Array<{ sheetName: string; result: ZerodhaParseResult }> = [];
  const allRows: ParsedHoldingRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const parsed = parseWorkbookSheet(sheet, sheetName);
    if (parsed.result.rows.length > 0) {
      parsedSheets.push(parsed);
      allRows.push(...parsed.result.rows);
    }
  }

  if (!parsedSheets.length) {
    return { rows: [], sheetsParsed: 0, sheetNames: [] };
  }

  const first = parsedSheets[0]!.result;

  return {
    rows: dedupeParsedRows(allRows),
    headerRow: first.headerRow,
    detectedHeaders: first.detectedHeaders,
    sheetName: parsedSheets.map((s) => s.sheetName).join(', '),
    sheetNames: parsedSheets.map((s) => s.sheetName),
    sheetsParsed: parsedSheets.length,
  };
}

export function parsedToHoldings(rows: ParsedHoldingRow[]): Holding[] {
  const now = nowIso();
  return rows.map((r) => ({
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    type: 'holding' as const,
    instrumentType: r.instrumentType,
    symbol: r.symbol,
    name: r.name,
    quantity: r.quantity,
    averagePrice: r.averagePrice,
    currentPrice: r.currentPrice || r.averagePrice,
    lastUpdated: now,
    broker: 'zerodha' as const,
  }));
}

export function mergeHoldings(
  existing: Holding[],
  imported: Holding[],
  mode: 'merge' | 'replace',
): Holding[] {
  if (mode === 'replace') {
    const nonZerodha = existing.filter((h) => h.broker !== 'zerodha');
    return [...nonZerodha, ...imported];
  }

  const map = new Map(existing.map((h) => [`${h.broker}:${h.symbol}`, h]));
  for (const h of imported) {
    map.set(`${h.broker}:${h.symbol}`, h);
  }
  return Array.from(map.values());
}
