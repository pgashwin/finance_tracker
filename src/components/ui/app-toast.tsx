import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/store/financeStore';

type ToastPhase = 'hidden' | 'enter' | 'visible' | 'exit';

const VISIBLE_MS = 4500;
const EXIT_MS = 200;

function toastIcon(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('fail') || lower.includes('error')) return 'error';
  return 'check_circle';
}

function toastIconClass(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('fail') || lower.includes('error')) return 'text-destructive';
  return 'text-success';
}

export function AppToast() {
  const toast = useFinanceStore((s) => s.toast);
  const clearToast = useFinanceStore((s) => s.clearToast);
  const [phase, setPhase] = useState<ToastPhase>('hidden');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!toast) return;

    setMessage(toast.message);
    setPhase('enter');

    const showTimer = window.setTimeout(() => setPhase('visible'), 20);
    const exitTimer = window.setTimeout(() => setPhase('exit'), VISIBLE_MS);
    const hideTimer = window.setTimeout(() => {
      clearToast();
      setPhase('hidden');
    }, VISIBLE_MS + EXIT_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [toast?.id, clearToast, toast]);

  if (phase === 'hidden' && !toast) return null;

  const iconName = toastIcon(message);

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex justify-center',
        'bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-4 right-4',
        'md:bottom-6 md:left-auto md:right-6 md:justify-end',
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        role="status"
        className={cn(
          'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-outline-variant/40',
          'bg-surface-container-highest px-4 py-3 text-foreground md-elevation-3',
          'transition-all duration-medium ease-md-emphasized',
          phase === 'enter' && 'translate-y-3 opacity-0',
          phase === 'visible' && 'translate-y-0 opacity-100',
          phase === 'exit' && 'translate-y-2 opacity-0',
        )}
      >
        <Icon
          name={iconName}
          size="sm"
          filled
          className={cn('mt-0.5 shrink-0', toastIconClass(message))}
        />
        <p className="flex-1 text-sm leading-snug">{message}</p>
        <button
          type="button"
          onClick={() => {
            setPhase('exit');
            window.setTimeout(() => {
              clearToast();
              setPhase('hidden');
            }, EXIT_MS);
          }}
          className="md-state-layer -mr-1 shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>
    </div>
  );
}
