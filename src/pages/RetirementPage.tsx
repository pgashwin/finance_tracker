import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatINR } from '@/utils/currency';
import type { RetirementAccount, RetirementAccountType } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { todayDate } from '@/utils/ids';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const accountTypes: RetirementAccountType[] = ['ppf', 'epf', 'nps', 'other'];

export function RetirementPage() {
  const items = useFinanceStore((s) => s.state.retirementAccounts);
  const add = useFinanceStore((s) => s.addRetirementAccount);
  const update = useFinanceStore((s) => s.updateRetirementAccount);
  const remove = useFinanceStore((s) => s.deleteRetirementAccount);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RetirementAccount | null>(null);

  const emptyForm = {
    accountType: 'ppf' as RetirementAccountType, name: '', accountNumber: '',
    currentBalance: '', annualContribution: '', employerContribution: '',
    interestRate: '', startDate: todayDate(), maturityDate: '',
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (item: RetirementAccount) => {
    setEditing(item);
    setForm({
      accountType: item.accountType, name: item.name, accountNumber: item.accountNumber ?? '',
      currentBalance: String(item.currentBalance),
      annualContribution: item.annualContribution != null ? String(item.annualContribution) : '',
      employerContribution: item.employerContribution != null ? String(item.employerContribution) : '',
      interestRate: item.interestRate != null ? String(item.interestRate) : '',
      startDate: item.startDate, maturityDate: item.maturityDate ?? '',
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      accountType: form.accountType, name: form.name, accountNumber: form.accountNumber || undefined,
      currentBalance: parseFloat(form.currentBalance) || 0,
      annualContribution: form.annualContribution ? parseFloat(form.annualContribution) : undefined,
      employerContribution: form.employerContribution ? parseFloat(form.employerContribution) : undefined,
      interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
      startDate: form.startDate, maturityDate: form.maturityDate || undefined,
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const totalBalance = items.reduce((s, i) => s + i.currentBalance, 0);
  const totalContribution = items.reduce(
    (s, i) => s + (i.annualContribution ?? 0) + (i.employerContribution ?? 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">PPF / PF</h2>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            {
              label: 'Total corpus',
              value: formatINR(totalBalance),
              sub: `${items.length} account(s)`,
              variant: 'positive',
            },
            {
              label: 'Annual contributions',
              value: formatINR(totalContribution),
              sub: 'Self + employer',
            },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No PPF, EPF, or NPS accounts yet.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.accountType.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatINR(item.currentBalance)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Account' : 'Add PPF / PF'} className="sm:max-w-xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Account Type</Label>
            <Select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value as RetirementAccountType })}>
              {accountTypes.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </Select>
          </div>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="sm:col-span-2"><Label>Current Balance (₹)</Label><Input type="number" min="0" value={form.currentBalance} onChange={(e) => setForm({ ...form, currentBalance: e.target.value })} required /></div>
          <div><Label>Annual Contribution</Label><Input type="number" min="0" value={form.annualContribution} onChange={(e) => setForm({ ...form, annualContribution: e.target.value })} /></div>
          <div><Label>Employer Contribution (EPF)</Label><Input type="number" min="0" value={form.employerContribution} onChange={(e) => setForm({ ...form, employerContribution: e.target.value })} /></div>
          <div><Label>Interest Rate (%)</Label><Input type="number" min="0" step="0.01" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} /></div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
          <Button type="submit" className="sm:col-span-2 w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
