import { useEffect } from 'react';
import { useFinanceStore } from '@/store/financeStore';

export function useDirtyGuard() {
  const isDirty = useFinanceStore((s) => s.isDirty);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}

/** Single light theme — strip any persisted dark class from older sessions. */
export function useLightThemeOnly() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);
}
