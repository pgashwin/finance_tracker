import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { CurrencySelect } from '@/components/ui/currency-select';
import { useCurrency } from '@/hooks/useCurrency';
import type { Asset, AssetCategory, CurrencyCode } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { todayDate } from '@/utils/ids';
import { Icon } from '@/components/ui/icon';

const categories: AssetCategory[] = ['real_estate', 'vehicle', 'gold', 'jewelry', 'other'];

export function AssetsPage() {
  const items = useFinanceStore((s) => s.state.assets);
  const add = useFinanceStore((s) => s.addAsset);
  const update = useFinanceStore((s) => s.updateAsset);
  const remove = useFinanceStore((s) => s.deleteAsset);
  const { format, formatCompact, toBase, baseCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);

  const emptyForm = {
    name: '', category: 'real_estate' as AssetCategory, purchasePrice: '',
    currentEstimatedValue: '', purchaseDate: todayDate(), lastValuationDate: todayDate(), location: '',
    currency: baseCurrency,
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, currency: baseCurrency }); setOpen(true); };
  const openEdit = (item: Asset) => {
    setEditing(item);
    setForm({
      name: item.name, category: item.category,
      purchasePrice: String(item.purchasePrice), currentEstimatedValue: String(item.currentEstimatedValue),
      purchaseDate: item.purchaseDate, lastValuationDate: item.lastValuationDate,
      location: item.location ?? '',
      currency: item.currency ?? baseCurrency,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, category: form.category,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      currentEstimatedValue: parseFloat(form.currentEstimatedValue) || 0,
      purchaseDate: form.purchaseDate, lastValuationDate: form.lastValuationDate,
      location: form.location || undefined,
      ...(form.currency !== baseCurrency ? { currency: form.currency as CurrencyCode } : {}),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalValue = items.reduce((s, i) => s + toBase(i.currentEstimatedValue, i.currency), 0);
  const totalPurchase = items.reduce((s, i) => s + toBase(i.purchasePrice, i.currency), 0);
  const totalGain = totalValue - totalPurchase;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Assets</h2>
        <Button onClick={openNew}><Icon name="add" size="sm" /> Add</Button>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            {
              label: 'Current value',
              value: format(totalValue),
              sub: `${items.length} asset(s)`,
            },
            { label: 'Purchase price', value: format(totalPurchase) },
            {
              label: 'Appreciation',
              value: formatCompact(totalGain),
              variant: totalGain >= 0 ? 'positive' : 'negative',
            },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No assets. Add house, vehicle, gold, etc.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category.replace(/_/g, ' ')}
                    {item.location && ` · ${item.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{format(item.currentEstimatedValue, item.currency)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Icon name="edit" size="sm" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Icon name="delete" size="sm" className="text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Asset' : 'Add Asset'} className="sm:max-w-xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}>
              {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>
          <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><Label>Purchase Price ({symbol})</Label><Input type="number" min="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required /></div>
          <div><Label>Current Value ({symbol})</Label><Input type="number" min="0" value={form.currentEstimatedValue} onChange={(e) => setForm({ ...form, currentEstimatedValue: e.target.value })} required /></div>
          <div>
            <Label>Currency</Label>
            <CurrencySelect value={form.currency} onChange={(currency) => setForm({ ...form, currency })} />
          </div>
          <div><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required /></div>
          <div><Label>Last Valuation</Label><Input type="date" value={form.lastValuationDate} onChange={(e) => setForm({ ...form, lastValuationDate: e.target.value })} required /></div>
          <Button type="submit" className="sm:col-span-2 w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
