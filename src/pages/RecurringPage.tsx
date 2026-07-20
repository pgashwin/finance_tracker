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
import { toMonthlyEquivalent } from '@/utils/currency';
import { emiMonthlyTotal, monthlyOutflow } from '@/services/analytics/netWorth';
import type { CurrencyCode, RecurringExpense, RecurringCategory, RecurrenceFrequency } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { todayDate } from '@/utils/ids';
import { Icon } from '@/components/ui/icon';

const categories: RecurringCategory[] = ['emi', 'subscription', 'insurance_premium', 'rent', 'utility', 'investment_sip', 'other'];
const frequencies: RecurrenceFrequency[] = ['monthly', 'quarterly', 'half_yearly', 'yearly'];

export function RecurringPage() {
  const state = useFinanceStore((s) => s.state);
  const items = state.recurringExpenses;
  const add = useFinanceStore((s) => s.addRecurringExpense);
  const update = useFinanceStore((s) => s.updateRecurringExpense);
  const remove = useFinanceStore((s) => s.deleteRecurringExpense);
  const { format, baseCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);

  const emptyForm = {
    name: '', category: 'emi' as RecurringCategory, amount: '', frequency: 'monthly' as RecurrenceFrequency,
    startDate: todayDate(), endDate: '', autoDebit: true, isActive: true, currency: baseCurrency,
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, currency: baseCurrency }); setOpen(true); };
  const openEdit = (item: RecurringExpense) => {
    setEditing(item);
    setForm({
      name: item.name, category: item.category, amount: String(item.amount),
      frequency: item.frequency, startDate: item.startDate, endDate: item.endDate ?? '',
      autoDebit: item.autoDebit, isActive: item.isActive,
      currency: item.currency ?? baseCurrency,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, category: form.category, amount: parseFloat(form.amount) || 0,
      frequency: form.frequency, startDate: form.startDate, endDate: form.endDate || undefined,
      autoDebit: form.autoDebit, isActive: form.isActive,
      ...(form.currency !== baseCurrency ? { currency: form.currency as CurrencyCode } : {}),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const activeItems = items.filter((i) => i.isActive);
  const monthlyTotal = monthlyOutflow(state);
  const emiMonthly = emiMonthlyTotal(state);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Recurring Expenses</h2>
        <Button onClick={openNew}><Icon name="add" size="sm" /> Add</Button>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            {
              label: 'Monthly outflow',
              value: format(monthlyTotal),
              sub: `${activeItems.length} active · ${items.length} total`,
              variant: 'negative',
            },
            { label: 'Annual outflow', value: format(monthlyTotal * 12) },
            { label: 'EMI (monthly)', value: format(emiMonthly), sub: 'EMI category only' },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No recurring expenses. Add EMIs, subscriptions, etc.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className={!item.isActive ? 'opacity-60' : ''}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.name} {!item.isActive && <span className="text-xs">(inactive)</span>}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category.replace(/_/g, ' ')} · {item.frequency} · ~{format(toMonthlyEquivalent(item.amount, item.frequency), item.currency)}/mo
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{format(item.amount, item.currency)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Icon name="edit" size="sm" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Icon name="delete" size="sm" className="text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit' : 'Add Recurring Expense'}>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as RecurringCategory })}>
              {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>
          <div><Label>Amount ({symbol})</Label><Input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div>
            <Label>Currency</Label>
            <CurrencySelect value={form.currency} onChange={(currency) => setForm({ ...form, currency })} />
          </div>
          <div>
            <Label>Frequency</Label>
            <Select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as RecurrenceFrequency })}>
              {frequencies.map((f) => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
          <div><Label>End Date (optional)</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.autoDebit} onChange={(e) => setForm({ ...form, autoDebit: e.target.checked })} /> Auto debit</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
