import { useCallback, useEffect, useState } from 'react';
import { loadAiConfig, saveAiConfig } from '@/services/ai/aiConfigStorage';
import type { AiConfig } from '@/services/ai/types';

export function useAiConfig() {
  const [config, setConfigState] = useState<AiConfig>(() => loadAiConfig());

  const setConfig = useCallback((next: AiConfig | ((prev: AiConfig) => AiConfig)) => {
    setConfigState((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      saveAiConfig(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'finance_tracker.ai_config') {
        setConfigState(loadAiConfig());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { config, setConfig };
}
