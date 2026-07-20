import { Icon } from './icon';
import { Button } from './button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-[2px]"
        style={{ animation: 'modal-backdrop var(--motion-duration-medium) var(--motion-easing-standard)' }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-50 w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border border-outline-variant/50 bg-card p-6 md-elevation-3 sm:max-w-lg sm:rounded-2xl scrollbar-md',
          className,
        )}
        style={{ animation: 'modal-panel var(--motion-duration-medium) var(--motion-easing-emphasized)' }}
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-medium">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <Icon name="close" size="md" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
