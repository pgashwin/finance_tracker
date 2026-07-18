import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencySelect } from '@/components/ui/currency-select';
import { useCurrency } from '@/hooks/useCurrency';
import { totalEmergencyFund, totalLiquidAssets } from '@/services/analytics/netWorth';
import type { CurrencyCode, LiquidFund } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export function LiquidFundsPage() {
  const state = useFinanceStore((s) => s.state);
  const items = state.liquidFunds;
  const add = useFinanceStore((s) => s.addLiquidFund);
  const update = useFinanceStore((s) => s.updateLiquidFund);
  const remove = useFinanceStore((s) => s.deleteLiquidFund);
  const { format, baseCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LiquidFund | null>(null);

  const [form, setForm] = useState({
    name: '',
    institution: '',
    balance: '',
    isEmergencyFund: false,
    currency: baseCurrency,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', institution: '', balance: '', isEmergencyFund: false, currency: baseCurrency });
    setOpen(true);
  };

  const openEdit = (item: LiquidFund) => {
    setEditing(item);
    setForm({
      name: item.name,
      institution: item.institution ?? '',
      balance: String(item.balance),
      isEmergencyFund: item.isEmergencyFund,
      currency: item.currency ?? baseCurrency,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      institution: form.institution || undefined,
      balance: parseFloat(form.balance) || 0,
      isEmergencyFund: form.isEmergencyFund,
      ...(form.currency !== baseCurrency ? { currency: form.currency as CurrencyCode } : {}),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalBalance = totalLiquidAssets(state);
  const emergencyTotal = totalEmergencyFund(state);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Liquid Funds</h2>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            { label: 'Total liquid', value: format(totalBalance), sub: `${items.length} account(s)` },
            { label: 'Emergency fund', value: format(emergencyTotal), variant: 'positive' },
            {
              label: 'Non-emergency',
              value: format(totalBalance - emergencyTotal),
            },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No liquid funds yet. Add bank accounts or cash.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">
                    {item.name}
                    {item.isEmergencyFund && (
                      <span className="ml-2 text-xs text-green-600">Emergency</span>
                    )}
                  </p>
                  {item.institution && (
                    <p className="text-sm text-muted-foreground">{item.institution}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{format(item.balance, item.currency)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit' : 'Add Liquid Fund'}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input id="institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="balance">Balance ({symbol})</Label>
            <Input id="balance" type="number" min="0" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <CurrencySelect
              id="currency"
              value={form.currency}
              onChange={(currency) => setForm({ ...form, currency })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isEmergencyFund} onChange={(e) => setForm({ ...form, isEmergencyFund: e.target.checked })} />
            Emergency fund
          </label>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
