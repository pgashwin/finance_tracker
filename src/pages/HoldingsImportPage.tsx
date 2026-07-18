import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/useCurrency';
import {
  parseZerodhaCsv,
  parseZerodhaXlsxDetailed,
  parsedToHoldings,
  mergeHoldings,
  type ParsedHoldingRow,
} from '@/services/import/zerodhaCsv';
import { ArrowLeft } from 'lucide-react';

export function HoldingsImportPage() {
  const holdings = useFinanceStore((s) => s.state.holdings);
  const setHoldings = useFinanceStore((s) => s.setHoldings);
  const showToast = useFinanceStore((s) => s.showToast);
  const { format } = useCurrency();
  const [preview, setPreview] = useState<ParsedHoldingRow[]>([]);
  const [parseInfo, setParseInfo] = useState<string | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');

  const handleFile = async (file: File) => {
    try {
      let rows: ParsedHoldingRow[] = [];
      setParseInfo(null);
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const result = parseZerodhaXlsxDetailed(buffer);
        rows = result.rows;
        if (result.sheetsParsed) {
          setParseInfo(
            `Read ${result.sheetsParsed} sheet(s): ${result.sheetNames?.join(', ')} · ${rows.length} holding(s)`,
          );
        } else if (result.detectedHeaders?.length) {
          setParseInfo(
            `Sheet: ${result.sheetName ?? 'unknown'}, header row ${(result.headerRow ?? 0) + 1}`,
          );
        }
      } else {
        const text = await file.text();
        rows = parseZerodhaCsv(text);
      }
      setPreview(rows);
      if (!rows.length) {
        showToast(
          'No holdings found. Use Console → Portfolio → Holdings → Download XLSX. CSV also works.',
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const confirmImport = () => {
    const imported = parsedToHoldings(preview);
    const merged = mergeHoldings(holdings, imported, mode);
    setHoldings(merged);
    showToast(`Imported ${imported.length} holding(s)`);
    setPreview([]);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/holdings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h2 className="text-2xl font-bold">Import Zerodha Report</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV or XLSX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download from Zerodha Console → Portfolio → Holdings → <strong>Download XLSX</strong>.
            The parser skips report title rows and auto-detects columns.
          </p>
          {parseInfo && (
            <p className="text-xs text-muted-foreground">Detected: {parseInfo}</p>
          )}
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
              <option value="merge">Merge with existing Zerodha holdings</option>
              <option value="replace">Replace all Zerodha holdings</option>
            </Select>
          </div>
        </CardContent>
      </Card>
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({preview.length} rows)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">LTP</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{r.symbol}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.quantity}</td>
                      <td className="p-2">{format(r.currentPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && (
                <p className="mt-2 text-xs text-muted-foreground">Showing first 20 of {preview.length}</p>
              )}
            </div>
            <Button onClick={confirmImport} className="w-full">Confirm Import</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
