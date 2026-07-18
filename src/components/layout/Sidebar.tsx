import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  TrendingUp,
  Bitcoin,
  Repeat,
  CreditCard,
  Shield,
  PiggyBank,
  Home,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/liquid-funds', label: 'Liquid Funds', icon: Wallet },
  { to: '/fixed-deposits', label: 'Fixed Deposits', icon: Landmark },
  { to: '/holdings', label: 'Holdings', icon: TrendingUp },
  { to: '/crypto', label: 'Crypto', icon: Bitcoin },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
  { to: '/loans', label: 'Loans', icon: CreditCard },
  { to: '/insurance', label: 'Insurance', icon: Shield },
  { to: '/retirement', label: 'PPF / PF', icon: PiggyBank },
  { to: '/assets', label: 'Assets', icon: Home },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const mobileNavLabels: Record<string, string> = {
  Dashboard: 'Home',
  'Liquid Funds': 'Liquid',
  'Fixed Deposits': 'FDs',
  'PPF / PF': 'PPF/PF',
};

function mobileNavLabel(label: string): string {
  return mobileNavLabels[label] ?? label.split(' ')[0] ?? label;
}

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] scrollbar-hide">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-w-[4.25rem] shrink-0 flex-col items-center gap-1 px-2 py-2 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="max-w-[4.5rem] truncate text-center">{mobileNavLabel(label)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
