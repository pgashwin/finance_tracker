import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { CurrencySelect } from '@/components/ui/currency-select';
import { useCurrency } from '@/hooks/useCurrency';
import { holdingCurrentValue, holdingGainLoss, holdingInvestedValue } from '@/services/analytics/netWorth';
import type { CurrencyCode, Holding } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { nowIso } from '@/utils/ids';
import { Icon } from '@/components/ui/icon';

export function HoldingsPage() {
  const items = useFinanceStore((s) => s.state.holdings);
  const add = useFinanceStore((s) => s.addHolding);
  const update = useFinanceStore((s) => s.updateHolding);
  const remove = useFinanceStore((s) => s.deleteHolding);
  const { format, formatCompact, toBase, baseCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | null>(null);

  const emptyForm = {
    symbol: '',
    name: '',
    quantity: '',
    averagePrice: '',
    currentPrice: '',
    instrumentType: 'stock' as Holding['instrumentType'],
    broker: 'other' as Holding['broker'],
    currency: baseCurrency,
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, currency: baseCurrency });
    setOpen(true);
  };

  const openEdit = (item: Holding) => {
    setEditing(item);
    setForm({
      symbol: item.symbol,
      name: item.name,
      quantity: String(item.quantity),
      averagePrice: String(item.averagePrice),
      currentPrice: String(item.currentPrice),
      instrumentType: item.instrumentType,
      broker: item.broker,
      currency: item.currency ?? baseCurrency,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      symbol: form.symbol,
      name: form.name,
      quantity: parseFloat(form.quantity) || 0,
      averagePrice: parseFloat(form.averagePrice) || 0,
      currentPrice: parseFloat(form.currentPrice) || 0,
      instrumentType: form.instrumentType,
      broker: form.broker,
      lastUpdated: nowIso(),
      ...(form.currency !== baseCurrency ? { currency: form.currency as CurrencyCode } : {}),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalInvested = items.reduce(
    (s, h) => s + toBase(holdingInvestedValue(h), h.currency),
    0,
  );
  const totalCurrent = items.reduce(
    (s, h) => s + toBase(holdingCurrentValue(h), h.currency),
    0,
  );
  const totalPnl = totalCurrent - totalInvested;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-medium tracking-tight">Holdings</h2>
        <div className="flex gap-2">
          <Link to="/holdings/import"><Button variant="outline"><Icon name="upload" size="sm" /> Import Zerodha</Button></Link>
          <Button onClick={openNew}><Icon name="add" size="sm" /> Add</Button>
        </div>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            { label: 'Current value', value: format(totalCurrent), sub: `${items.length} holding(s)` },
            { label: 'Invested', value: format(totalInvested) },
            {
              label: 'Unrealized P&L',
              value: formatCompact(totalPnl),
              variant: totalPnl >= 0 ? 'positive' : 'negative',
            },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No holdings yet. Add manually or import from Zerodha.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-2">Name</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Invested</th>
                <th className="p-2">Current</th>
                <th className="p-2">P&L</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const pnl = holdingGainLoss(item);
                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.symbol} · {item.broker}</div>
                    </td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">{format(holdingInvestedValue(item), item.currency)}</td>
                    <td className="p-2">{format(holdingCurrentValue(item), item.currency)}</td>
                    <td className={`p-2 ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>{format(pnl, item.currency)}</td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Icon name="edit" size="sm" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Icon name="delete" size="sm" className="text-destructive" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Holding' : 'Add Holding'} className="sm:max-w-xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Symbol</Label><Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} required /></div>
          <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>Quantity</Label><Input type="number" min="0" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
          <div><Label>Avg Price ({symbol})</Label><Input type="number" min="0" step="any" value={form.averagePrice} onChange={(e) => setForm({ ...form, averagePrice: e.target.value })} required /></div>
          <div><Label>Current Price ({symbol})</Label><Input type="number" min="0" step="any" value={form.currentPrice} onChange={(e) => setForm({ ...form, currentPrice: e.target.value })} required /></div>
          <div>
            <Label>Currency</Label>
            <CurrencySelect value={form.currency} onChange={(currency) => setForm({ ...form, currency })} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.instrumentType} onChange={(e) => setForm({ ...form, instrumentType: e.target.value as Holding['instrumentType'] })}>
              <option value="stock">Stock</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="etf">ETF</option>
              <option value="bond">Bond</option>
            </Select>
          </div>
          <div>
            <Label>Broker</Label>
            <Select value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value as Holding['broker'] })}>
              <option value="zerodha">Zerodha</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <Button type="submit" className="sm:col-span-2 w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
