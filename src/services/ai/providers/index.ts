import type { AiConfig, StreamChatOptions, TestConnectionResult } from '../types';
import { streamAnthropicChat, testAnthropicConnection } from './anthropic';
import { streamGeminiChat, testGeminiConnection } from './gemini';
import { streamOpenAiChat, testOpenAiConnection } from './openaiCompatible';

export async function testConnection(config: AiConfig): Promise<TestConnectionResult> {
  switch (config.providerType) {
    case 'gemini':
      return testGeminiConnection(config);
    case 'anthropic':
      return testAnthropicConnection(config);
    case 'openai':
    case 'openai_compatible':
      return testOpenAiConnection(config);
    default:
      return { ok: false, message: `Unsupported provider: ${config.providerType}` };
  }
}

export async function streamChat(options: StreamChatOptions): Promise<string> {
  switch (options.config.providerType) {
    case 'gemini':
      return streamGeminiChat(options);
    case 'anthropic':
      return streamAnthropicChat(options);
    case 'openai':
    case 'openai_compatible':
      return streamOpenAiChat(options);
    default:
      throw new Error(`Unsupported provider: ${options.config.providerType}`);
  }
}

export { testGeminiConnection, streamGeminiChat } from './gemini';
export { testOpenAiConnection, streamOpenAiChat } from './openaiCompatible';
export { testAnthropicConnection, streamAnthropicChat } from './anthropic';
