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
import { termInsuranceCoverage } from '@/services/analytics/netWorth';
import type { CurrencyCode, InsurancePolicy, InsuranceType, RecurrenceFrequency } from '@/types';
import { BucketTotalBar } from '@/components/ui/bucket-total-bar';
import { todayDate } from '@/utils/ids';
import { Icon } from '@/components/ui/icon';

const types: InsuranceType[] = ['term', 'endowment', 'ulip', 'health', 'other'];

export function InsurancePage() {
  const state = useFinanceStore((s) => s.state);
  const items = state.insurancePolicies;
  const add = useFinanceStore((s) => s.addInsurancePolicy);
  const update = useFinanceStore((s) => s.updateInsurancePolicy);
  const remove = useFinanceStore((s) => s.deleteInsurancePolicy);
  const { format, toBase, baseCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InsurancePolicy | null>(null);

  const emptyForm = {
    policyName: '', insurer: 'LIC', policyNumber: '', insuranceType: 'term' as InsuranceType,
    sumAssured: '', annualPremium: '', premiumFrequency: 'yearly' as RecurrenceFrequency,
    startDate: todayDate(), maturityDate: '', nominees: '', isActive: true, currency: baseCurrency,
  };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, currency: baseCurrency }); setOpen(true); };
  const openEdit = (item: InsurancePolicy) => {
    setEditing(item);
    setForm({
      policyName: item.policyName, insurer: item.insurer, policyNumber: item.policyNumber ?? '',
      insuranceType: item.insuranceType, sumAssured: String(item.sumAssured),
      annualPremium: String(item.annualPremium), premiumFrequency: item.premiumFrequency,
      startDate: item.startDate, maturityDate: item.maturityDate ?? '',
      nominees: item.nominees ?? '', isActive: item.isActive,
      currency: item.currency ?? baseCurrency,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      policyName: form.policyName, insurer: form.insurer, policyNumber: form.policyNumber || undefined,
      insuranceType: form.insuranceType, sumAssured: parseFloat(form.sumAssured) || 0,
      annualPremium: parseFloat(form.annualPremium) || 0, premiumFrequency: form.premiumFrequency,
      startDate: form.startDate, maturityDate: form.maturityDate || undefined,
      nominees: form.nominees || undefined, isActive: form.isActive,
      ...(form.currency !== baseCurrency ? { currency: form.currency as CurrencyCode } : {}),
    };
    if (editing) update(editing.id, data);
    else add(data);
    setOpen(false);
  };

  const activePolicies = items.filter((i) => i.isActive);
  const totalCover = activePolicies.reduce((s, i) => s + toBase(i.sumAssured, i.currency), 0);
  const totalPremium = activePolicies.reduce((s, i) => s + toBase(i.annualPremium, i.currency), 0);
  const termCover = termInsuranceCoverage(state);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Insurance</h2>
        <Button onClick={openNew}><Icon name="add" size="sm" /> Add</Button>
      </div>
      {items.length > 0 && (
        <BucketTotalBar
          stats={[
            {
              label: 'Total cover (active)',
              value: format(totalCover),
              sub: `${activePolicies.length} active policy(ies)`,
            },
            { label: 'Term life cover', value: format(termCover) },
            { label: 'Annual premium', value: format(totalPremium), variant: 'negative' },
          ]}
        />
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground">No insurance policies. Add LIC/term insurance details.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.policyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.insurer} · {item.insuranceType} · Cover {format(item.sumAssured, item.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{format(item.annualPremium, item.currency)}/yr</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Icon name="edit" size="sm" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Icon name="delete" size="sm" className="text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Policy' : 'Add Insurance'} className="sm:max-w-xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Policy Name</Label><Input value={form.policyName} onChange={(e) => setForm({ ...form, policyName: e.target.value })} required /></div>
          <div><Label>Insurer</Label><Input value={form.insurer} onChange={(e) => setForm({ ...form, insurer: e.target.value })} required /></div>
          <div><Label>Policy Number</Label><Input value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} /></div>
          <div>
            <Label>Type</Label>
            <Select value={form.insuranceType} onChange={(e) => setForm({ ...form, insuranceType: e.target.value as InsuranceType })}>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div><Label>Sum Assured ({symbol})</Label><Input type="number" min="0" value={form.sumAssured} onChange={(e) => setForm({ ...form, sumAssured: e.target.value })} required /></div>
          <div><Label>Annual Premium ({symbol})</Label><Input type="number" min="0" value={form.annualPremium} onChange={(e) => setForm({ ...form, annualPremium: e.target.value })} required /></div>
          <div>
            <Label>Currency</Label>
            <CurrencySelect value={form.currency} onChange={(currency) => setForm({ ...form, currency })} />
          </div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <Button type="submit" className="sm:col-span-2 w-full">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
