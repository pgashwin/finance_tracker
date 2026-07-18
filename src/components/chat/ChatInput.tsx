import { Button } from '@/components/ui/button';
import { Send, Square } from 'lucide-react';
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
    <div className="flex items-end gap-2 border-t bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled && !isStreaming}
        placeholder={placeholder}
        className="max-h-40 min-h-[2.5rem] flex-1 resize-none overflow-y-auto rounded-2xl border border-input bg-background px-4 py-2.5 pr-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 scrollbar-md-hover"
      />
      {isStreaming ? (
        <Button type="button" variant="outline" size="icon" onClick={onStop} aria-label="Stop">
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
