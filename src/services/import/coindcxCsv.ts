import type { CryptoHolding } from '@/types';
import { generateId, nowIso } from '@/utils/ids';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedCryptoRow {
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[.\s_]+/g, '');
}

function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const c of candidates) {
    const idx = normalized.indexOf(normalizeHeader(c));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[,₹\s]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function extractSymbolFromMarket(market: string): string {
  const upper = market.trim().toUpperCase();
  if (upper.endsWith('INR')) return upper.slice(0, -3);
  if (upper.endsWith('USDT')) return upper.slice(0, -4);
  if (upper.includes('/')) return upper.split('/')[0]!;
  if (upper.includes('-')) return upper.split('-')[0]!;
  return upper;
}

function isBuySide(side: string): boolean {
  const s = side.trim().toLowerCase();
  return s === 'buy' || s === 'b' || s.includes('buy');
}

function isSellSide(side: string): boolean {
  const s = side.trim().toLowerCase();
  return s === 'sell' || s === 's' || s.includes('sell');
}

function parseHoldingsRows(rows: string[][], headers: string[]): ParsedCryptoRow[] {
  const symbolIdx = findColumn(headers, [
    'symbol',
    'coin',
    'currency',
    'cryptoname',
    'crypto',
    'asset',
    'token',
  ]);
  const marketIdx = findColumn(headers, ['market', 'pair', 'tradingpair']);
  const qtyIdx = findColumn(headers, [
    'quantity',
    'qty',
    'totalquantity',
    'balance',
    'holdings',
    'netquantity',
    'availablebalance',
  ]);
  const avgIdx = findColumn(headers, [
    'averagebuyprice',
    'avgbuyprice',
    'avgprice',
    'buyprice',
    'averageprice',
    'costprice',
  ]);
  const ltpIdx = findColumn(headers, [
    'currentprice',
    'ltp',
    'lastprice',
    'price',
    'priceperunit',
    'marketprice',
  ]);
  const valueIdx = findColumn(headers, ['marketvalue', 'inrvalue', 'value', 'currentvalue']);

  if (qtyIdx < 0) return [];

  const results: ParsedCryptoRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const market = marketIdx >= 0 ? String(row[marketIdx] ?? '').trim() : '';
    const symbolRaw = symbolIdx >= 0 ? String(row[symbolIdx] ?? '').trim() : market;
    const symbol = market ? extractSymbolFromMarket(market) : symbolRaw.toUpperCase();
    if (!symbol) continue;

    const quantity = parseNumber(row[qtyIdx]);
    if (quantity <= 0) continue;

    let averageBuyPrice = avgIdx >= 0 ? parseNumber(row[avgIdx]) : 0;
    let currentPrice = ltpIdx >= 0 ? parseNumber(row[ltpIdx]) : 0;

    if (currentPrice === 0 && valueIdx >= 0 && quantity > 0) {
      currentPrice = parseNumber(row[valueIdx]) / quantity;
    }
    if (averageBuyPrice === 0) averageBuyPrice = currentPrice;

    results.push({
      symbol,
      name: symbol,
      quantity,
      averageBuyPrice,
      currentPrice: currentPrice || averageBuyPrice,
    });
  }

  return results;
}

function parseOrderHistoryRows(rows: string[][], headers: string[]): ParsedCryptoRow[] {
  const marketIdx = findColumn(headers, ['market', 'pair', 'symbol', 'tradingpair']);
  const sideIdx = findColumn(headers, ['side', 'type', 'ordertype', 'eventtype']);
  const qtyIdx = findColumn(headers, ['totalquantity', 'quantity', 'qty', 'filledquantity']);
  const priceIdx = findColumn(headers, ['priceperunit', 'price', 'rate', 'avgprice', 'averageprice']);

  if (marketIdx < 0 || sideIdx < 0 || qtyIdx < 0) return [];

  interface Agg {
    quantity: number;
    costBasis: number;
    lastPrice: number;
  }

  const map = new Map<string, Agg>();

  for (const row of rows) {
    const market = String(row[marketIdx] ?? '').trim();
    const side = String(row[sideIdx] ?? '').trim();
    const qty = parseNumber(row[qtyIdx]);
    const price = priceIdx >= 0 ? parseNumber(row[priceIdx]) : 0;
    if (!market || qty <= 0) continue;

    const symbol = extractSymbolFromMarket(market);
    const agg = map.get(symbol) ?? { quantity: 0, costBasis: 0, lastPrice: price };

    if (isBuySide(side)) {
      agg.costBasis += qty * price;
      agg.quantity += qty;
    } else if (isSellSide(side)) {
      if (agg.quantity > 0) {
        const avgCost = agg.costBasis / agg.quantity;
        const sellQty = Math.min(qty, agg.quantity);
        agg.quantity -= sellQty;
        agg.costBasis -= sellQty * avgCost;
      }
    }

    if (price > 0) agg.lastPrice = price;
    map.set(symbol, agg);
  }

  return Array.from(map.entries())
    .filter(([, agg]) => agg.quantity > 0.00000001)
    .map(([symbol, agg]) => ({
      symbol,
      name: symbol,
      quantity: agg.quantity,
      averageBuyPrice: agg.quantity > 0 ? agg.costBasis / agg.quantity : 0,
      currentPrice: agg.lastPrice || (agg.quantity > 0 ? agg.costBasis / agg.quantity : 0),
    }));
}

function parseSheetData(data: string[][], preferOrders = false): ParsedCryptoRow[] {
  if (!data.length) return [];
  const headers = data[0]!.map(String);
  const body = data.slice(1);

  if (preferOrders) {
    const orders = parseOrderHistoryRows(body, headers);
    if (orders.length > 0) return orders;
    return parseHoldingsRows(body, headers);
  }

  const holdings = parseHoldingsRows(body, headers);
  if (holdings.length > 0) return holdings;
  return parseOrderHistoryRows(body, headers);
}

export function parseCoinDcxCsv(text: string, preferOrders = false): ParsedCryptoRow[] {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  if (!result.data.length) return [];
  return parseSheetData(result.data.map((r) => r.map(String)), preferOrders);
}

export function parseCoinDcxXlsx(buffer: ArrayBuffer, preferOrders = false): ParsedCryptoRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]!];
  if (!sheet) return [];

  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  if (!data.length) return [];
  return parseSheetData(data.map((r) => (r ?? []).map(String)), preferOrders);
}

export function parsedToCryptoHoldings(rows: ParsedCryptoRow[]): CryptoHolding[] {
  const now = nowIso();
  return rows.map((r) => ({
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    type: 'crypto' as const,
    symbol: r.symbol,
    name: r.name,
    quantity: r.quantity,
    averageBuyPrice: r.averageBuyPrice,
    currentPrice: r.currentPrice || r.averageBuyPrice,
    lastUpdated: now,
    exchange: 'coindcx' as const,
    quoteCurrency: 'INR' as const,
  }));
}

export function mergeCryptoHoldings(
  existing: CryptoHolding[],
  imported: CryptoHolding[],
  mode: 'merge' | 'replace',
): CryptoHolding[] {
  if (mode === 'replace') {
    const nonCoinDcx = existing.filter((h) => h.exchange !== 'coindcx');
    return [...nonCoinDcx, ...imported];
  }

  const map = new Map(existing.map((h) => [`${h.exchange}:${h.symbol}`, h]));
  for (const h of imported) {
    map.set(`${h.exchange}:${h.symbol}`, h);
  }
  return Array.from(map.values());
}
