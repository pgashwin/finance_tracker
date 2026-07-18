import { useFinanceStore } from '@/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export function SettingsPage() {
  const profile = useFinanceStore((s) => s.state.profile);
  const settings = useFinanceStore((s) => s.state.settings);
  const updateProfile = useFinanceStore((s) => s.updateProfile);
  const updateSettings = useFinanceStore((s) => s.updateSettings);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Display Name</Label>
            <Input
              value={profile.displayName ?? ''}
              onChange={(e) => updateProfile({ displayName: e.target.value || undefined })}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label>Monthly Income (₹, net take-home)</Label>
            <Input
              type="number"
              min="0"
              value={profile.monthlyIncome ?? ''}
              onChange={(e) =>
                updateProfile({
                  monthlyIncome: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="For EMI & insurance ratios"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onChange={(e) =>
                updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.showCents}
              onChange={(e) => updateSettings({ showCents: e.target.checked })}
            />
            Show paise in currency amounts
          </label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All financial data lives in your checkpoint file on your device. This app does not send
            your data to any server. Remember to save your checkpoint after making changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
