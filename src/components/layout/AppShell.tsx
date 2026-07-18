import { Outlet } from 'react-router-dom';
import { Sidebar, MobileNav } from './Sidebar';
import { CheckpointToolbar } from '@/components/checkpoint/CheckpointToolbar';
import { useFinanceStore } from '@/store/financeStore';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

export function AppShell() {
  const toast = useFinanceStore((s) => s.toast);
  const clearToast = useFinanceStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 4000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 md-elevation-1">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Finance Tracker</h1>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                Data stays on your device
              </p>
            </div>
            <CheckpointToolbar />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <footer className="hidden border-t px-6 py-3 text-center text-xs text-muted-foreground md:block">
          Privacy-first finance tracker — checkpoint files are stored locally on your device only.
        </footer>
      </div>
      <MobileNav />
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 rounded-xl bg-accent p-4 text-accent-foreground md-elevation-2 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
          <p className="text-sm">{toast}</p>
        </div>
      )}
    </div>
  );
}
