import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  disabled,
  isStreaming,
  placeholder = 'Ask about your portfolio…',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  return (
    <div className="shrink-0 pt-2">
      <div
        className={cn(
          'flex items-end gap-1 rounded-[1.75rem] border border-outline-variant/50 bg-surface-container-low p-1.5',
          'shadow-sm transition-[box-shadow,border-color] duration-short',
          'focus-within:border-primary/35 focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/25',
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled && !isStreaming}
          placeholder={placeholder}
          className="max-h-40 min-h-[2.5rem] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-50 scrollbar-md-hover"
        />
        {isStreaming ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="mb-0.5 shrink-0"
            onClick={onStop}
            aria-label="Stop"
          >
            <Icon name="stop" size="sm" filled />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="mb-0.5 shrink-0"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            aria-label="Send"
          >
            <Icon name="send" size="sm" filled />
          </Button>
        )}
      </div>
    </div>
  );
}
