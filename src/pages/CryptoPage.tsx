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
import { getCurrencySymbol } from '@/utils/currency';
import { cryptoCurrentValue, cryptoGainLoss, cryptoInvestedValue, totalCryptoValue } from '@/services/analytics/netWorth';
import type { CryptoHolding, CurrencyCode } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { nowIso } from '@/utils/ids';
import { Icon } from '@/components/ui/icon';

export function CryptoPage() {
  const state = useFinanceStore((s) => s.state);
  const items = state.cryptoHoldings ?? [];
  const add = useFinanceStore((s) => s.addCryptoHolding);
  const update = useFinanceStore((s) => s.updateCryptoHolding);
  const remove = useFinanceStore((s) => s.deleteCryptoHolding);
  const { format, formatCompact, toBase, baseCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CryptoHolding | null>(null);

  const emptyForm = {
    symbol: '',
    name: '',
    quantity: '',
    averageBuyPrice: '',
    currentPrice: '',
    exchange: 'other' as CryptoHolding['exchange'],
    quoteCurrency: baseCurrency,
  };
  const [form, setForm] = useState(emptyForm);
  const priceSymbol = getCurrencySymbol(form.quoteCurrency);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, quoteCurrency: baseCurrency });
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
      quoteCurrency: item.quoteCurrency ?? baseCurrency,
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
      quoteCurrency: form.quoteCurrency as CurrencyCode,
      lastUpdated: nowIso(),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalValue = totalCryptoValue(state);
  const totalInvested = items.reduce(
    (sum, h) => sum + toBase(cryptoInvestedValue(h), h.quoteCurrency),
    0,
  );
  const totalPnl = items.reduce(
    (sum, h) => sum + toBase(cryptoGainLoss(h), h.quoteCurrency),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-medium tracking-tight">Crypto</h2>
        <div className="flex gap-2">
          <Link to="/crypto/import">
            <Button variant="outline">
              <Icon name="upload" size="sm" /> Import CoinDCX
            </Button>
          </Link>
          <Button onClick={openNew}>
            <Icon name="add" size="sm" /> Add
          </Button>
        </div>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            { label: 'Current value', value: format(totalValue), sub: `${items.length} coin(s)` },
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
                    <td className="p-2">{format(cryptoInvestedValue(item), item.quoteCurrency)}</td>
                    <td className="p-2">{format(cryptoCurrentValue(item), item.quoteCurrency)}</td>
                    <td className={`p-2 ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {format(pnl, item.quoteCurrency)}
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Icon name="edit" size="sm" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                        <Icon name="delete" size="sm" className="text-destructive" />
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
            <Label>Quote Currency</Label>
            <CurrencySelect
              value={form.quoteCurrency}
              onChange={(quoteCurrency) => setForm({ ...form, quoteCurrency })}
            />
          </div>
          <div>
            <Label>Avg Buy Price ({priceSymbol})</Label>
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
            <Label>Current Price ({priceSymbol})</Label>
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
