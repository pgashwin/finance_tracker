import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MessageSquare, Trash2 } from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { useAiConfig } from '@/hooks/useAiConfig';
import { ChatMessageBubble } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  buildPortfolioContext,
  formatPortfolioContextForPrompt,
} from '@/services/ai/portfolioContext';
import { SYSTEM_PROMPT, sanitizeAssistantOutput } from '@/services/ai/systemPrompt';
import { streamChat } from '@/services/ai/providers';
import {
  clearChatHistory,
  isAiConfigured,
  loadChatHistory,
  saveChatHistory,
} from '@/services/ai/aiConfigStorage';
import type { ChatMessage } from '@/services/ai/types';
import { generateId, nowIso } from '@/utils/ids';
import { generateInsights } from '@/services/analytics/insights';

export function ChatPage() {
  const state = useFinanceStore((s) => s.state);
  const { config } = useAiConfig();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclosureAccepted, setDisclosureAccepted] = useState(
    () => localStorage.getItem('finance_tracker.chat_disclosure') === '1',
  );
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const configured = isAiConfigured(config);

  useEffect(() => {
    saveChatHistory(messages.filter((m) => m.content.trim()));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isStreaming]);

  const insightSuggestions = generateInsights(state)
    .slice(0, 3)
    .map((i) => `Tell me more about: ${i.title}`);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming || !configured) return;

      if (!disclosureAccepted) {
        localStorage.setItem('finance_tracker.chat_disclosure', '1');
        setDisclosureAccepted(true);
      }

      setError(null);
      setInput('');

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        createdAt: nowIso(),
      };

      const assistantId = generateId();
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: nowIso(),
      };

      const history = messages;
      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const context = buildPortfolioContext(state, {
        redactSensitiveIds: config.redactSensitiveIds,
      });
      const portfolioContext = formatPortfolioContextForPrompt(context);

      try {
        await streamChat({
          config,
          systemPrompt: SYSTEM_PROMPT,
          portfolioContext,
          messages: history,
          userMessage: trimmed,
          signal: controller.signal,
          onChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m,
              ),
            );
          },
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: sanitizeAssistantOutput(m.content) } : m,
          ),
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content || 'Sorry, I could not complete that request.',
                }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [configured, config, disclosureAccepted, isStreaming, messages, state],
  );

  const handleClearHistory = () => {
    if (!window.confirm('Clear all chat messages on this device?')) return;
    clearChatHistory();
    setMessages([]);
    setError(null);
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col md:h-[calc(100dvh-2rem)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="h-6 w-6" />
            Portfolio Chat
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask questions about your finances using AI. Your API key stays on this device.
          </p>
        </div>
        {messages.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={handleClearHistory}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {!configured && (
        <Card className="mb-4 border-warning/40 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="font-medium">AI assistant not configured</p>
              <p className="mt-1 text-muted-foreground">
                Add your Gemini, OpenAI, or Claude API key in Settings to start chatting.
              </p>
              <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
                Go to Settings
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!disclosureAccepted && configured && (
        <Card className="mb-4">
          <CardContent className="space-y-3 p-4 text-sm">
            <p className="font-medium">Privacy notice</p>
            <p className="text-muted-foreground">
              Each message sends your question plus a summarized portfolio snapshot to the AI
              provider you configured ({config.presetId}). API keys and chat history are stored
              only in this browser&apos;s localStorage — never in your checkpoint file.
            </p>
            <Button type="button" size="sm" onClick={() => setDisclosureAccepted(true)}>
              I understand
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-4 border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4 scrollbar-md">
        {messages.length === 0 ? (
          <div className="space-y-4 py-8">
            <p className="text-center text-sm text-muted-foreground">
              Try a suggested question or ask anything about your portfolio.
            </p>
            <SuggestedQuestions
              onSelect={(q) => void sendMessage(q)}
              disabled={!configured || isStreaming || !disclosureAccepted}
              suggestions={
                insightSuggestions.length > 0 ? insightSuggestions : undefined
              }
            />
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isStreaming={isStreaming && message.role === 'assistant' && !message.content}
            />
          ))
        )}
      </div>

      {messages.length > 0 && (
        <div className="mb-2">
          <SuggestedQuestions
            onSelect={(q) => void sendMessage(q)}
            disabled={!configured || isStreaming}
            suggestions={insightSuggestions.length > 0 ? insightSuggestions.slice(0, 2) : undefined}
          />
        </div>
      )}

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => void sendMessage(input)}
        onStop={stopStreaming}
        disabled={!configured || (!disclosureAccepted && configured)}
        isStreaming={isStreaming}
      />
    </div>
  );
}
