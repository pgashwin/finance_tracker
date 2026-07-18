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
  const primary = navItems.slice(0, 5);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-card md:hidden">
      {primary.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label.split(' ')[0]}</span>
        </NavLink>
      ))}
    </nav>
  );
}
