import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencySelect } from '@/components/ui/currency-select';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate, formatPercent } from '@/utils/currency';
import { totalFixedDeposits } from '@/services/analytics/netWorth';
import type { CurrencyCode, FixedDeposit } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { todayDate } from '@/utils/ids';
import { Icon } from '@/components/ui/icon';

export function FixedDepositsPage() {
  const state = useFinanceStore((s) => s.state);
  const items = state.fixedDeposits;
  const add = useFinanceStore((s) => s.addFixedDeposit);
  const update = useFinanceStore((s) => s.updateFixedDeposit);
  const remove = useFinanceStore((s) => s.deleteFixedDeposit);
  const { format, baseCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FixedDeposit | null>(null);

  const emptyForm = {
    name: '',
    institution: '',
    principal: '',
    interestRate: '',
    startDate: todayDate(),
    maturityDate: '',
    autoRenew: false,
    taxDeductedAtSource: true,
    currency: baseCurrency,
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, currency: baseCurrency });
    setOpen(true);
  };

  const openEdit = (item: FixedDeposit) => {
    setEditing(item);
    setForm({
      name: item.name,
      institution: item.institution,
      principal: String(item.principal),
      interestRate: String(item.interestRate),
      startDate: item.startDate,
      maturityDate: item.maturityDate,
      autoRenew: item.autoRenew,
      taxDeductedAtSource: item.taxDeductedAtSource,
      currency: item.currency ?? baseCurrency,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      institution: form.institution,
      principal: parseFloat(form.principal) || 0,
      interestRate: parseFloat(form.interestRate) || 0,
      startDate: form.startDate,
      maturityDate: form.maturityDate,
      autoRenew: form.autoRenew,
      taxDeductedAtSource: form.taxDeductedAtSource,
      ...(form.currency !== baseCurrency ? { currency: form.currency as CurrencyCode } : {}),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalPrincipal = totalFixedDeposits(state);
  const avgRate =
    items.reduce((s, i) => s + i.principal, 0) > 0
      ? items.reduce((s, i) => s + i.interestRate * i.principal, 0) /
        items.reduce((s, i) => s + i.principal, 0)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Fixed Deposits</h2>
        <Button onClick={openNew}><Icon name="add" size="sm" /> Add</Button>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            { label: 'Total principal', value: format(totalPrincipal), sub: `${items.length} FD(s)` },
            { label: 'Avg interest rate', value: formatPercent(avgRate), sub: 'Weighted by principal' },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No fixed deposits yet.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.institution} · {item.interestRate}% · Matures {formatDate(item.maturityDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{format(item.principal, item.currency)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Icon name="edit" size="sm" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Icon name="delete" size="sm" className="text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit FD' : 'Add Fixed Deposit'}>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>Institution</Label><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required /></div>
          <div><Label>Principal ({symbol})</Label><Input type="number" min="0" value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} required /></div>
          <div>
            <Label>Currency</Label>
            <CurrencySelect value={form.currency} onChange={(currency) => setForm({ ...form, currency })} />
          </div>
          <div><Label>Interest Rate (% p.a.)</Label><Input type="number" min="0" step="0.01" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} required /></div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
          <div><Label>Maturity Date</Label><Input type="date" value={form.maturityDate} onChange={(e) => setForm({ ...form, maturityDate: e.target.value })} required /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} /> Auto renew</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.taxDeductedAtSource} onChange={(e) => setForm({ ...form, taxDeductedAtSource: e.target.checked })} /> TDS applicable</label>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
