import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, MobileNav } from './Sidebar';
import { CheckpointToolbar } from '@/components/checkpoint/CheckpointToolbar';
import { AppToast } from '@/components/ui/app-toast';
import { Icon } from '@/components/ui/icon';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-outline-variant/40 bg-surface-container-lowest/90 backdrop-blur-md md-elevation-1">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="md:hidden">
              <h1 className="text-xl font-medium tracking-tight text-primary">Finance Tracker</h1>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="verified_user" size="xs" className="text-primary" />
                Data stays on your device
              </p>
            </div>
            <div className="hidden md:block" />
            <CheckpointToolbar />
          </div>
        </header>
        <main className="flex-1 bg-background p-4 md:p-6">
          <div key={location.pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </main>
        <footer className="hidden border-t border-outline-variant/30 bg-surface-container-low px-6 py-3 text-center text-xs text-muted-foreground md:block">
          Privacy-first finance tracker — checkpoint files are stored locally on your device only.
        </footer>
      </div>
      <MobileNav />
      <AppToast />
    </div>
  );
}
