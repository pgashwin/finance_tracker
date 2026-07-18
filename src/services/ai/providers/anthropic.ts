import type { AiConfig, StreamChatOptions, TestConnectionResult } from '../types';
import { buildUserMessageWithContext } from '../systemPrompt';
import {
  corsErrorMessage,
  normalizeBaseUrl,
  parseJsonResponse,
} from './utils';

const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

function toAnthropicMessages(options: StreamChatOptions): AnthropicMessage[] {
  const history: AnthropicMessage[] = options.messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const userText = buildUserMessageWithContext(
    options.portfolioContext,
    options.userMessage,
    new Date().toISOString().slice(0, 10),
  );

  return [...history, { role: 'user', content: userText }];
}

function anthropicUrl(baseUrl: string): string {
  const normalized = normalizeBaseUrl(baseUrl);
  if (normalized.endsWith('/v1')) return `${normalized}/messages`;
  return `${normalized}/v1/messages`;
}

function extractAnthropicDelta(eventType: string | null, payload: string): string {
  if (eventType !== 'content_block_delta') return '';
  try {
    const json = JSON.parse(payload) as {
      type?: string;
      delta?: { type?: string; text?: string };
    };
    if (json.delta?.type === 'text_delta') return json.delta.text ?? '';
    return '';
  } catch {
    return '';
  }
}

async function readAnthropicSseStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent: string | null = null;

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          currentEvent = null;
          continue;
        }
        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
          continue;
        }
        if (trimmed.startsWith('data:')) {
          const data = trimmed.slice(5).trim();
          const chunk = extractAnthropicDelta(currentEvent, data);
          if (chunk) onChunk(chunk);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function testAnthropicConnection(config: AiConfig): Promise<TestConnectionResult> {
  const url = anthropicUrl(config.baseUrl);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 16,
        system: 'Reply with exactly: OK',
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });

    if (!response.ok) {
      const err = await parseJsonResponse<{ error?: { message?: string } }>(response);
      return { ok: false, message: err.error?.message ?? `HTTP ${response.status}` };
    }

    return { ok: true, message: 'Connected to Anthropic successfully.' };
  } catch (error) {
    const message = error instanceof TypeError ? corsErrorMessage('Anthropic') : String(error);
    return { ok: false, message };
  }
}

export async function streamAnthropicChat(options: StreamChatOptions): Promise<string> {
  const url = anthropicUrl(options.config.baseUrl);
  let fullText = '';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': options.config.apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: options.config.model,
      max_tokens: 2048,
      stream: true,
      system: options.systemPrompt,
      messages: toAnthropicMessages(options),
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await parseJsonResponse<{ error?: { message?: string } }>(response);
    throw new Error(err.error?.message ?? `Anthropic HTTP ${response.status}`);
  }

  if (!response.body) throw new Error('Anthropic returned an empty response body.');

  await readAnthropicSseStream(
    response.body,
    (chunk) => {
      fullText += chunk;
      options.onChunk(chunk);
    },
    options.signal,
  );

  return fullText;
}

/** Exported for unit tests */
export function formatAnthropicMessagesForTest(options: StreamChatOptions): AnthropicMessage[] {
  return toAnthropicMessages(options);
}
