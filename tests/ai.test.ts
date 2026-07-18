import { describe, it, expect } from 'vitest';
import { createEmptyState } from '@/schemas/checkpoint';
import {
  buildPortfolioContext,
  estimateContextSizeBytes,
  formatPortfolioContextForPrompt,
} from '@/services/ai/portfolioContext';
import { buildUserMessageWithContext, sanitizeAssistantOutput } from '@/services/ai/systemPrompt';
import { formatGeminiContentsForTest } from '@/services/ai/providers/gemini';
import { formatOpenAiMessagesForTest } from '@/services/ai/providers/openaiCompatible';
import { formatAnthropicMessagesForTest } from '@/services/ai/providers/anthropic';
import { applyPreset, DEFAULT_AI_CONFIG } from '@/services/ai/types';
import { generateId, nowIso } from '@/utils/ids';

describe('portfolio context', () => {
  it('builds a compact context snapshot from finance state', () => {
    const state = createEmptyState();
    state.profile.displayName = 'Test User';
    state.profile.monthlyIncome = 100000;
    state.liquidFunds.push({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'liquid_fund',
      name: 'Savings',
      balance: 250000,
      isEmergencyFund: true,
      accountNumber: '1234567890',
    });

    const context = buildPortfolioContext(state);
    expect(context.baseCurrency).toBe('INR');
    expect(context.summary.netWorth).toBe(250000);
    expect(context.summary.monthlyIncome).toBe(100000);
    expect(context.allocation.length).toBeGreaterThan(0);
    expect(context.ratios).toHaveProperty('liquidityRatio');
  });

  it('keeps context payload under 15 KB for typical state', () => {
    const state = createEmptyState();
    state.holdings = Array.from({ length: 30 }, (_, i) => ({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'holding' as const,
      instrumentType: 'stock' as const,
      symbol: `SYM${i}`,
      name: `Stock ${i}`,
      quantity: 10,
      averagePrice: 100,
      currentPrice: 120,
      lastUpdated: nowIso(),
      broker: 'other' as const,
      folioNumber: `FOLIO-${i}`,
    }));

    const context = buildPortfolioContext(state, { maxTopHoldings: 10 });
    expect(context.topHoldings).toHaveLength(10);
    expect(estimateContextSizeBytes(context)).toBeLessThan(15 * 1024);
  });

  it('redacts sensitive identifiers when enabled', () => {
    const state = createEmptyState();
    state.liquidFunds.push({
      id: generateId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      type: 'liquid_fund',
      name: 'Savings',
      balance: 1000,
      isEmergencyFund: false,
      accountNumber: '1234567890',
    });

    const json = formatPortfolioContextForPrompt(
      buildPortfolioContext(state, { redactSensitiveIds: true }),
    );
    expect(json).not.toContain('1234567890');
  });
});

describe('provider message formatting', () => {
  const baseOptions = {
    config: { ...DEFAULT_AI_CONFIG, apiKey: 'test-key' },
    systemPrompt: 'You are helpful.',
    portfolioContext: '{"netWorth":100}',
    messages: [
      { id: '1', role: 'user' as const, content: 'Hello', createdAt: nowIso() },
      { id: '2', role: 'assistant' as const, content: 'Hi there', createdAt: nowIso() },
    ],
    userMessage: 'How is my debt?',
    onChunk: () => {},
  };

  it('maps chat roles for Gemini contents', () => {
    const contents = formatGeminiContentsForTest(baseOptions);
    expect(contents).toHaveLength(3);
    expect(contents[0]).toEqual({ role: 'user', parts: [{ text: 'Hello' }] });
    expect(contents[1]).toEqual({ role: 'model', parts: [{ text: 'Hi there' }] });
    expect(contents[2]?.role).toBe('user');
    expect(contents[2]?.parts[0]?.text).toContain('How is my debt?');
    expect(contents[2]?.parts[0]?.text).toContain('{"netWorth":100}');
  });

  it('builds OpenAI-compatible messages with system prompt', () => {
    const messages = formatOpenAiMessagesForTest(baseOptions);
    expect(messages[0]?.role).toBe('system');
    expect(messages.at(-1)?.role).toBe('user');
    expect(messages.at(-1)?.content).toContain('User question: How is my debt?');
  });

  it('builds Anthropic messages without system role in messages array', () => {
    const messages = formatAnthropicMessagesForTest(baseOptions);
    expect(messages.every((m) => m.role === 'user' || m.role === 'assistant')).toBe(true);
    expect(messages.at(-1)?.content).toContain('User question: How is my debt?');
  });

  it('wraps user questions with portfolio context block', () => {
    const wrapped = buildUserMessageWithContext('{"a":1}', 'What is my net worth?', '2026-07-18');
    expect(wrapped).toContain('[Portfolio snapshot as of 2026-07-18]');
    expect(wrapped).toContain('User question: What is my net worth?');
  });

  it('strips markdown asterisks from assistant output', () => {
    const raw = `**Net Worth:** ₹1,00,96,500
*   **Savings Rate:** 81.74%
* **Emergency Fund:** Healthy buffer`;
    const cleaned = sanitizeAssistantOutput(raw);
    expect(cleaned).not.toContain('**');
    expect(cleaned).toContain('Net Worth: ₹1,00,96,500');
    expect(cleaned).toContain('• Savings Rate: 81.74%');
  });
});

describe('AI presets', () => {
  it('applies Gemini, OpenAI, and Anthropic preset defaults', () => {
    const gemini = applyPreset('gemini', DEFAULT_AI_CONFIG);
    expect(gemini.providerType).toBe('gemini');
    expect(gemini.baseUrl).toContain('generativelanguage.googleapis.com');

    const openai = applyPreset('openai', DEFAULT_AI_CONFIG);
    expect(openai.providerType).toBe('openai');
    expect(openai.baseUrl).toContain('api.openai.com');

    const anthropic = applyPreset('anthropic', DEFAULT_AI_CONFIG);
    expect(anthropic.providerType).toBe('anthropic');
    expect(anthropic.baseUrl).toContain('anthropic.com');
  });
});
