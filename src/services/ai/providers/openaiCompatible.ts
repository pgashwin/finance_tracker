import type { AiConfig, StreamChatOptions, TestConnectionResult } from '../types';
import { buildUserMessageWithContext } from '../systemPrompt';
import {
  corsErrorMessage,
  normalizeOpenAiBaseUrl,
  parseJsonResponse,
  readSseStream,
} from './utils';

interface OpenAiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function toOpenAiMessages(options: StreamChatOptions): OpenAiMessage[] {
  const userText = buildUserMessageWithContext(
    options.portfolioContext,
    options.userMessage,
    new Date().toISOString().slice(0, 10),
  );

  return [
    { role: 'system', content: options.systemPrompt },
    ...options.messages.map(
      (m): OpenAiMessage => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }),
    ),
    { role: 'user', content: userText },
  ];
}

function authHeaders(config: AiConfig): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey.trim()) {
    headers.Authorization = `Bearer ${config.apiKey.trim()}`;
  }
  return headers;
}

function extractOpenAiDelta(payload: string): string {
  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    return json.choices?.[0]?.delta?.content ?? '';
  } catch {
    return '';
  }
}

export async function testOpenAiConnection(config: AiConfig): Promise<TestConnectionResult> {
  const baseUrl = normalizeOpenAiBaseUrl(config.baseUrl);
  const url = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(config),
      body: JSON.stringify({
        model: config.model,
        max_tokens: 16,
        messages: [
          { role: 'system', content: 'Reply with exactly: OK' },
          { role: 'user', content: 'ping' },
        ],
      }),
    });

    if (!response.ok) {
      const err = await parseJsonResponse<{ error?: { message?: string } }>(response);
      return { ok: false, message: err.error?.message ?? `HTTP ${response.status}` };
    }

    return { ok: true, message: 'Connected successfully.' };
  } catch (error) {
    const message = error instanceof TypeError ? corsErrorMessage('OpenAI-compatible API') : String(error);
    return { ok: false, message };
  }
}

export async function streamOpenAiChat(options: StreamChatOptions): Promise<string> {
  const baseUrl = normalizeOpenAiBaseUrl(options.config.baseUrl);
  const url = `${baseUrl}/chat/completions`;
  let fullText = '';

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(options.config),
    body: JSON.stringify({
      model: options.config.model,
      stream: true,
      temperature: 0.4,
      max_tokens: 2048,
      messages: toOpenAiMessages(options),
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await parseJsonResponse<{ error?: { message?: string } }>(response);
    throw new Error(err.error?.message ?? `OpenAI HTTP ${response.status}`);
  }

  if (!response.body) throw new Error('OpenAI-compatible API returned an empty response body.');

  await readSseStream(
    response.body,
    (payload) => {
      const chunk = extractOpenAiDelta(payload);
      if (chunk) {
        fullText += chunk;
        options.onChunk(chunk);
      }
    },
    options.signal,
  );

  return fullText;
}

/** Exported for unit tests */
export function formatOpenAiMessagesForTest(options: StreamChatOptions): OpenAiMessage[] {
  return toOpenAiMessages(options);
}
