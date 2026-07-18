import type { AiConfig, ChatMessage, StreamChatOptions, TestConnectionResult } from '../types';
import { buildUserMessageWithContext } from '../systemPrompt';
import {
  corsErrorMessage,
  normalizeBaseUrl,
  parseJsonResponse,
  readSseStream,
} from './utils';

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

function toGeminiHistory(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

function buildGeminiBody(
  options: StreamChatOptions,
  stream: boolean,
): Record<string, unknown> {
  const userText = buildUserMessageWithContext(
    options.portfolioContext,
    options.userMessage,
    new Date().toISOString().slice(0, 10),
  );

  const contents: GeminiContent[] = [
    ...toGeminiHistory(options.messages),
    { role: 'user', parts: [{ text: userText }] },
  ];

  return {
    systemInstruction: { parts: [{ text: options.systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: stream ? 2048 : 64,
    },
  };
}

function extractGeminiText(payload: string): string {
  try {
    const json = JSON.parse(payload) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  } catch {
    return '';
  }
}

export async function testGeminiConnection(config: AiConfig): Promise<TestConnectionResult> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const url = `${baseUrl}/models/${encodeURIComponent(config.model)}:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.apiKey,
      },
      body: JSON.stringify(
        buildGeminiBody(
          {
            config,
            systemPrompt: 'Reply with exactly: OK',
            portfolioContext: '{}',
            messages: [],
            userMessage: 'ping',
            onChunk: () => {},
          },
          false,
        ),
      ),
    });

    if (!response.ok) {
      const err = await parseJsonResponse<{ error?: { message?: string } }>(response);
      return { ok: false, message: err.error?.message ?? `HTTP ${response.status}` };
    }

    return { ok: true, message: 'Connected to Gemini successfully.' };
  } catch (error) {
    const message = error instanceof TypeError ? corsErrorMessage('Gemini') : String(error);
    return { ok: false, message };
  }
}

export async function streamGeminiChat(options: StreamChatOptions): Promise<string> {
  const baseUrl = normalizeBaseUrl(options.config.baseUrl);
  const url = `${baseUrl}/models/${encodeURIComponent(options.config.model)}:streamGenerateContent?alt=sse`;
  let fullText = '';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': options.config.apiKey,
    },
    body: JSON.stringify(buildGeminiBody(options, true)),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await parseJsonResponse<{ error?: { message?: string } }>(response);
    throw new Error(err.error?.message ?? `Gemini HTTP ${response.status}`);
  }

  if (!response.body) throw new Error('Gemini returned an empty response body.');

  await readSseStream(
    response.body,
    (payload) => {
      const chunk = extractGeminiText(payload);
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
export function formatGeminiContentsForTest(options: StreamChatOptions): GeminiContent[] {
  const body = buildGeminiBody(options, true) as { contents: GeminiContent[] };
  return body.contents;
}
