import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/services/ai/types';
import { Icon } from '@/components/ui/icon';

interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function ChatMessageBubble({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}
      aria-live={isStreaming ? 'polite' : undefined}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary-container text-secondary-container-foreground',
        )}
      >
        <Icon name={isUser ? 'person' : 'smart_toy'} size="sm" filled={!isUser} />
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-outline-variant/40 bg-card md-elevation-1',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {isStreaming && !message.content && (
          <span className="inline-flex gap-1 text-muted-foreground">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse [animation-delay:150ms]">●</span>
            <span className="animate-pulse [animation-delay:300ms]">●</span>
          </span>
        )}
      </div>
    </div>
  );
}
