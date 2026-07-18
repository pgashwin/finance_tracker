export function parseSseLines(
  buffer: string,
  onData: (payload: string) => void,
): string {
  const parts = buffer.split('\n');
  const remainder = parts.pop() ?? '';

  for (const line of parts) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':')) continue;
    if (trimmed.startsWith('data:')) {
      const data = trimmed.slice(5).trim();
      if (data && data !== '[DONE]') onData(data);
    }
  }

  return remainder;
}

export async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onData: (payload: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSseLines(buffer, onData);
    }
    if (buffer.trim()) parseSseLines(`${buffer}\n`, onData);
  } finally {
    reader.releaseLock();
  }
}

export function corsErrorMessage(providerLabel: string): string {
  return `Could not reach ${providerLabel}. This is often a CORS block when calling cloud APIs directly from the browser. Try Ollama locally, OpenRouter, or a CORS-enabled proxy/gateway.`;
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 300) || `HTTP ${response.status}`);
  }
}

export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function normalizeOpenAiBaseUrl(url: string): string {
  const trimmed = normalizeBaseUrl(url);
  if (trimmed.endsWith('/v1')) return trimmed;
  return `${trimmed}/v1`;
}
