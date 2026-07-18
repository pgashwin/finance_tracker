import {
  DEFAULT_AI_CONFIG,
  type AiConfig,
  type ChatMessage,
} from './types';

const AI_CONFIG_KEY = 'finance_tracker.ai_config';
const CHAT_HISTORY_KEY = 'finance_tracker.chat_history';
const MAX_STORED_MESSAGES = 50;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadAiConfig(): AiConfig {
  if (!isBrowser()) return { ...DEFAULT_AI_CONFIG };
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    return { ...DEFAULT_AI_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

export function saveAiConfig(config: AiConfig): void {
  if (!isBrowser()) return;
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

export function clearAiConfig(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AI_CONFIG_KEY);
}

export function loadChatHistory(): ChatMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (!isBrowser()) return;
  const trimmed = messages.slice(-MAX_STORED_MESSAGES);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
}

export function clearChatHistory(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

export function isAiConfigured(config: AiConfig): boolean {
  if (!config.enabled) return false;
  if (!config.baseUrl.trim() || !config.model.trim()) return false;
  if (config.presetId === 'ollama') return true;
  return config.apiKey.trim().length > 0;
}
