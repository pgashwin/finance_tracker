import { describe, it, expect } from 'vitest';
import { dynamicCardTheme } from '@/utils/dynamicCardTheme';

describe('dynamicCardTheme', () => {
  it('maps assessment status to M3 container roles', () => {
    expect(dynamicCardTheme('good').card).toContain('success-container');
    expect(dynamicCardTheme('warn').card).toContain('warning-container');
    expect(dynamicCardTheme('bad').card).toContain('destructive-container');
    expect(dynamicCardTheme('neutral').card).toContain('secondary-container');
    expect(dynamicCardTheme('na').card).toContain('surface-container');
  });

  it('falls back to trend when status is missing', () => {
    expect(dynamicCardTheme(undefined, 'positive').card).toContain('success-container');
    expect(dynamicCardTheme(undefined, 'negative').card).toContain('destructive-container');
  });

  it('prefers explicit status over trend', () => {
    expect(dynamicCardTheme('warn', 'positive').card).toContain('warning-container');
  });
});
