import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/liquid-funds', label: 'Liquid Funds', icon: 'account_balance_wallet' },
  { to: '/fixed-deposits', label: 'Fixed Deposits', icon: 'savings' },
  { to: '/holdings', label: 'Holdings', icon: 'trending_up' },
  { to: '/crypto', label: 'Crypto', icon: 'currency_bitcoin' },
  { to: '/recurring', label: 'Recurring', icon: 'autorenew' },
  { to: '/loans', label: 'Loans', icon: 'credit_card' },
  { to: '/insurance', label: 'Insurance', icon: 'shield' },
  { to: '/retirement', label: 'PPF / PF', icon: 'account_balance' },
  { to: '/assets', label: 'Assets', icon: 'home' },
  { to: '/chat', label: 'AI Assistant', icon: 'chat' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
] as const;

const mobileNavLabels: Record<string, string> = {
  Dashboard: 'Home',
  'Liquid Funds': 'Liquid',
  'Fixed Deposits': 'FDs',
  'PPF / PF': 'PPF/PF',
  'AI Assistant': 'Assistant',
};

function mobileNavLabel(label: string): string {
  return mobileNavLabels[label] ?? label.split(' ')[0] ?? label;
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-outline-variant/40 bg-surface-container-low md:block">
      <div className="border-b border-outline-variant/30 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground md-elevation-1">
            <Icon name="account_balance" size="md" filled className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">Finance Tracker</p>
            <p className="text-xs text-muted-foreground">Personal portfolio</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('md-nav-item', isActive ? 'md-nav-item-active' : 'md-nav-item-inactive')
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={icon} size="sm" filled={isActive} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/40 bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden md-elevation-2"
      aria-label="Main navigation"
    >
      <div className="flex overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] scrollbar-hide">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-w-[4.25rem] shrink-0 flex-col items-center gap-0.5 px-2 py-2.5 text-xs transition-colors duration-short',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-8 w-14 items-center justify-center rounded-full transition-all duration-medium',
                    isActive && 'bg-primary-container text-primary-container-foreground',
                  )}
                >
                  <Icon name={icon} size="sm" filled={isActive} />
                </span>
                <span className="max-w-[4.5rem] truncate text-center font-medium">
                  {mobileNavLabel(label)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
