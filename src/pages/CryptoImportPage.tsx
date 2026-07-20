import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/useCurrency';
import {
  parseCoinDcxCsv,
  parseCoinDcxXlsx,
  parsedToCryptoHoldings,
  mergeCryptoHoldings,
  type ParsedCryptoRow,
} from '@/services/import/coindcxCsv';
import { Icon } from '@/components/ui/icon';

export function CryptoImportPage() {
  const cryptoHoldings = useFinanceStore((s) => s.state.cryptoHoldings ?? []);
  const setCryptoHoldings = useFinanceStore((s) => s.setCryptoHoldings);
  const showToast = useFinanceStore((s) => s.showToast);
  const { format } = useCurrency();
  const [preview, setPreview] = useState<ParsedCryptoRow[]>([]);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [importType, setImportType] = useState<'holdings' | 'orders'>('holdings');

  const handleFile = async (file: File) => {
    try {
      let rows: ParsedCryptoRow[] = [];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        rows = parseCoinDcxXlsx(buffer, importType === 'orders');
      } else {
        const text = await file.text();
        rows = parseCoinDcxCsv(text, importType === 'orders');
      }
      setPreview(rows);
      if (!rows.length) {
        showToast(
          'No crypto holdings found. Try Order History CSV if you exported trades.',
        );
      }
    } catch {
      showToast('Failed to parse CoinDCX file');
    }
  };

  const confirmImport = () => {
    const imported = parsedToCryptoHoldings(preview);
    const merged = mergeCryptoHoldings(cryptoHoldings, imported, mode);
    setCryptoHoldings(merged);
    showToast(`Imported ${imported.length} crypto holding(s)`);
    setPreview([]);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/crypto">
          <Button variant="ghost" size="icon">
            <Icon name="arrow_back" size="sm" />
          </Button>
        </Link>
        <h2 className="text-2xl font-medium tracking-tight">Import CoinDCX Report</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV or XLSX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export from CoinDCX: <strong>Orders → Order History → Download CSV</strong>, or your
            portfolio/holdings report if available. The parser auto-detects holdings or trade
            history format.
          </p>
          <div>
            <Label>Report type hint</Label>
            <Select
              value={importType}
              onChange={(e) => setImportType(e.target.value as 'holdings' | 'orders')}
            >
              <option value="holdings">Holdings / Portfolio report</option>
              <option value="orders">Order History (aggregates buys/sells)</option>
            </Select>
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="text-sm"
          />
          <div>
            <Label>Import mode</Label>
            <Select value={mode} onChange={(e) => setMode(e.target.value as 'merge' | 'replace')}>
              <option value="merge">Merge with existing CoinDCX holdings</option>
              <option value="replace">Replace all CoinDCX holdings</option>
            </Select>
          </div>
        </CardContent>
      </Card>
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({preview.length} coins)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Avg Buy</th>
                    <th className="p-2">Current</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{r.symbol}</td>
                      <td className="p-2">{r.quantity}</td>
                      <td className="p-2">{format(r.averageBuyPrice)}</td>
                      <td className="p-2">{format(r.currentPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Showing first 20 of {preview.length}
                </p>
              )}
            </div>
            <Button onClick={confirmImport} className="w-full">
              Confirm Import
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
