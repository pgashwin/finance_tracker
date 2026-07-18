export type ProviderType = 'gemini' | 'openai' | 'anthropic' | 'openai_compatible';

export interface AiProviderPreset {
  id: string;
  label: string;
  providerType: ProviderType;
  baseUrl: string;
  defaultModel: string;
  apiKeyLabel: string;
  docsUrl?: string;
  docsLabel?: string;
}

export interface AiConfig {
  enabled: boolean;
  presetId: string;
  providerType: ProviderType;
  baseUrl: string;
  apiKey: string;
  model: string;
  redactSensitiveIds: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface StreamChatOptions {
  config: AiConfig;
  systemPrompt: string;
  portfolioContext: string;
  messages: ChatMessage[];
  userMessage: string;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
}

export interface TestConnectionResult {
  ok: boolean;
  message: string;
}

export const AI_PROVIDER_PRESETS: AiProviderPreset[] = [
  {
    id: 'gemini',
    label: 'Google AI Studio (Gemini)',
    providerType: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    apiKeyLabel: 'Gemini API key',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'Get a key at Google AI Studio',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    providerType: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    apiKeyLabel: 'OpenAI API key',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'Get a key at OpenAI Platform',
  },
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    providerType: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-20250514',
    apiKeyLabel: 'Anthropic API key',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'Get a key at Anthropic Console',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    providerType: 'openai_compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.0-flash-001',
    apiKeyLabel: 'OpenRouter API key',
    docsUrl: 'https://openrouter.ai/keys',
    docsLabel: 'Get a key at OpenRouter',
  },
  {
    id: 'ollama',
    label: 'Ollama (local)',
    providerType: 'openai_compatible',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    apiKeyLabel: 'API key (optional for Ollama)',
    docsUrl: 'https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server',
    docsLabel: 'Ollama CORS setup',
  },
  {
    id: 'custom',
    label: 'Custom OpenAI-compatible',
    providerType: 'openai_compatible',
    baseUrl: '',
    defaultModel: '',
    apiKeyLabel: 'API key',
  },
];

export const DEFAULT_AI_CONFIG: AiConfig = {
  enabled: false,
  presetId: 'gemini',
  providerType: 'gemini',
  baseUrl: AI_PROVIDER_PRESETS[0]!.baseUrl,
  apiKey: '',
  model: AI_PROVIDER_PRESETS[0]!.defaultModel,
  redactSensitiveIds: true,
};

export function getPresetById(id: string): AiProviderPreset | undefined {
  return AI_PROVIDER_PRESETS.find((p) => p.id === id);
}

export function applyPreset(presetId: string, current: AiConfig): AiConfig {
  const preset = getPresetById(presetId);
  if (!preset) return current;
  return {
    ...current,
    presetId,
    providerType: preset.providerType,
    baseUrl: preset.baseUrl,
    model: preset.defaultModel || current.model,
  };
}
