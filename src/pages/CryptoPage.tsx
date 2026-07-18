import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatINR, formatCompactINR } from '@/utils/currency';
import { cryptoCurrentValue, cryptoGainLoss, cryptoInvestedValue } from '@/services/analytics/netWorth';
import type { CryptoHolding } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { nowIso } from '@/utils/ids';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';

export function CryptoPage() {
  const items = useFinanceStore((s) => s.state.cryptoHoldings ?? []);
  const add = useFinanceStore((s) => s.addCryptoHolding);
  const update = useFinanceStore((s) => s.updateCryptoHolding);
  const remove = useFinanceStore((s) => s.deleteCryptoHolding);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CryptoHolding | null>(null);

  const emptyForm = {
    symbol: '',
    name: '',
    quantity: '',
    averageBuyPrice: '',
    currentPrice: '',
    exchange: 'other' as CryptoHolding['exchange'],
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: CryptoHolding) => {
    setEditing(item);
    setForm({
      symbol: item.symbol,
      name: item.name,
      quantity: String(item.quantity),
      averageBuyPrice: String(item.averageBuyPrice),
      currentPrice: String(item.currentPrice),
      exchange: item.exchange,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = form.symbol.toUpperCase();
    const data = {
      symbol,
      name: form.name || symbol,
      quantity: parseFloat(form.quantity) || 0,
      averageBuyPrice: parseFloat(form.averageBuyPrice) || 0,
      currentPrice: parseFloat(form.currentPrice) || 0,
      exchange: form.exchange,
      quoteCurrency: 'INR' as const,
      lastUpdated: nowIso(),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalValue = items.reduce((sum, h) => sum + cryptoCurrentValue(h), 0);
  const totalInvested = items.reduce((sum, h) => sum + cryptoInvestedValue(h), 0);
  const totalPnl = items.reduce((sum, h) => sum + cryptoGainLoss(h), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Crypto</h2>
        <div className="flex gap-2">
          <Link to="/crypto/import">
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Import CoinDCX
            </Button>
          </Link>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            { label: 'Current value', value: formatINR(totalValue), sub: `${items.length} coin(s)` },
            { label: 'Invested', value: formatINR(totalInvested) },
            {
              label: 'Unrealized P&L',
              value: formatCompactINR(totalPnl),
              variant: totalPnl >= 0 ? 'positive' : 'negative',
            },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No crypto holdings yet. Add manually or import from CoinDCX.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-2">Coin</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Invested</th>
                <th className="p-2">Current</th>
                <th className="p-2">P&L</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const pnl = cryptoGainLoss(item);
                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.symbol} · {item.exchange}
                      </div>
                    </td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">{formatINR(cryptoInvestedValue(item))}</td>
                    <td className="p-2">{formatINR(cryptoCurrentValue(item))}</td>
                    <td className={`p-2 ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatINR(pnl)}
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Crypto' : 'Add Crypto'}
        className="sm:max-w-xl"
      >
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Symbol</Label>
            <Input
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              placeholder="BTC"
              required
            />
          </div>
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Bitcoin"
            />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Avg Buy Price (₹)</Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={form.averageBuyPrice}
              onChange={(e) => setForm({ ...form, averageBuyPrice: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Current Price (₹)</Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={form.currentPrice}
              onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Exchange</Label>
            <Select
              value={form.exchange}
              onChange={(e) =>
                setForm({ ...form, exchange: e.target.value as CryptoHolding['exchange'] })
              }
            >
              <option value="coindcx">CoinDCX</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <Button type="submit" className="sm:col-span-2 w-full">
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}
