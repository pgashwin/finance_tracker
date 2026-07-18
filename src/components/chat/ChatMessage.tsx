import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/services/ai/types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function ChatMessageBubble({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
      aria-live={isStreaming ? 'polite' : undefined}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-card md-elevation-1 border',
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
