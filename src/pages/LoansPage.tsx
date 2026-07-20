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
import { totalLiabilities } from '@/services/analytics/netWorth';
import type { CurrencyCode, Loan, LoanType } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { todayDate } from '@/utils/ids';
import { Icon } from '@/components/ui/icon';

const loanTypes: LoanType[] = ['home', 'car', 'personal', 'education', 'gold', 'other'];

export function LoansPage() {
  const state = useFinanceStore((s) => s.state);
  const items = state.loans;
  const add = useFinanceStore((s) => s.addLoan);
  const update = useFinanceStore((s) => s.updateLoan);
  const remove = useFinanceStore((s) => s.deleteLoan);
  const { format, toBase, baseCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Loan | null>(null);

  const emptyForm = {
    name: '', loanType: 'home' as LoanType, lender: '', principal: '', outstandingBalance: '',
    interestRate: '', emiAmount: '', tenureMonths: '', startDate: todayDate(), currency: baseCurrency,
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, currency: baseCurrency }); setOpen(true); };
  const openEdit = (item: Loan) => {
    setEditing(item);
    setForm({
      name: item.name, loanType: item.loanType, lender: item.lender,
      principal: String(item.principal), outstandingBalance: String(item.outstandingBalance),
      interestRate: String(item.interestRate), emiAmount: String(item.emiAmount),
      tenureMonths: String(item.tenureMonths), startDate: item.startDate,
      currency: item.currency ?? baseCurrency,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, loanType: form.loanType, lender: form.lender,
      principal: parseFloat(form.principal) || 0, outstandingBalance: parseFloat(form.outstandingBalance) || 0,
      interestRate: parseFloat(form.interestRate) || 0, emiAmount: parseFloat(form.emiAmount) || 0,
      tenureMonths: parseInt(form.tenureMonths, 10) || 0, startDate: form.startDate,
      ...(form.currency !== baseCurrency ? { currency: form.currency as CurrencyCode } : {}),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalOutstanding = totalLiabilities(state);
  const totalEmi = items.reduce((s, i) => s + toBase(i.emiAmount, i.currency), 0);
  const totalPrincipal = items.reduce((s, i) => s + toBase(i.principal, i.currency), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Loans</h2>
        <Button onClick={openNew}><Icon name="add" size="sm" /> Add</Button>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            {
              label: 'Total outstanding',
              value: format(totalOutstanding),
              sub: `${items.length} loan(s)`,
              variant: 'negative',
            },
            { label: 'Total EMI / month', value: format(totalEmi) },
            { label: 'Original principal', value: format(totalPrincipal) },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No loans recorded.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.lender} · {item.loanType} · EMI {format(item.emiAmount, item.currency)} @ {item.interestRate}%
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-destructive">{format(item.outstandingBalance, item.currency)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Icon name="edit" size="sm" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Icon name="delete" size="sm" className="text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Loan' : 'Add Loan'} className="sm:max-w-xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>Lender</Label><Input value={form.lender} onChange={(e) => setForm({ ...form, lender: e.target.value })} required /></div>
          <div>
            <Label>Type</Label>
            <Select value={form.loanType} onChange={(e) => setForm({ ...form, loanType: e.target.value as LoanType })}>
              {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div><Label>Principal ({symbol})</Label><Input type="number" min="0" value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} required /></div>
          <div><Label>Outstanding ({symbol})</Label><Input type="number" min="0" value={form.outstandingBalance} onChange={(e) => setForm({ ...form, outstandingBalance: e.target.value })} required /></div>
          <div><Label>Interest Rate (%)</Label><Input type="number" min="0" step="0.01" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} required /></div>
          <div><Label>EMI ({symbol})</Label><Input type="number" min="0" value={form.emiAmount} onChange={(e) => setForm({ ...form, emiAmount: e.target.value })} required /></div>
          <div>
            <Label>Currency</Label>
            <CurrencySelect value={form.currency} onChange={(currency) => setForm({ ...form, currency })} />
          </div>
          <div><Label>Tenure (months)</Label><Input type="number" min="1" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })} required /></div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
          <Button type="submit" className="sm:col-span-2 w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
