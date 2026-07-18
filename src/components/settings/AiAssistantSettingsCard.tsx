import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAiConfig } from '@/hooks/useAiConfig';
import {
  AI_PROVIDER_PRESETS,
  applyPreset,
  getPresetById,
} from '@/services/ai/types';
import { clearAiConfig, clearChatHistory } from '@/services/ai/aiConfigStorage';
import { testConnection } from '@/services/ai/providers';

export function AiAssistantSettingsCard() {
  const { config, setConfig } = useAiConfig();
  const [testStatus, setTestStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const preset = getPresetById(config.presetId);

  const handlePresetChange = (presetId: string) => {
    setConfig((prev) => applyPreset(presetId, prev));
    setTestStatus(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const result = await testConnection(config);
      setTestStatus(result);
    } finally {
      setTesting(false);
    }
  };

  const handleClearKeys = () => {
    if (!window.confirm('Remove saved API key and reset AI settings on this device?')) return;
    clearAiConfig();
    clearChatHistory();
    setConfig({
      enabled: false,
      presetId: 'gemini',
      providerType: 'gemini',
      baseUrl: AI_PROVIDER_PRESETS[0]!.baseUrl,
      apiKey: '',
      model: AI_PROVIDER_PRESETS[0]!.defaultModel,
      redactSensitiveIds: true,
    });
    setTestStatus(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant (BYOK)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Bring your own API key to chat about your portfolio on the{' '}
          <Link to="/chat" className="text-primary underline-offset-4 hover:underline">
            Chat
          </Link>{' '}
          page. Keys are stored in this browser only — never in your checkpoint file.
        </p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
          />
          Enable portfolio chat assistant
        </label>

        <div>
          <Label>Provider</Label>
          <Select value={config.presetId} onChange={(e) => handlePresetChange(e.target.value)}>
            {AI_PROVIDER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Base URL / endpoint</Label>
          <Input
            value={config.baseUrl}
            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
            placeholder="https://generativelanguage.googleapis.com/v1beta"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            API root for your provider. Gemini, OpenAI, and Anthropic defaults are pre-filled.
          </p>
        </div>

        <div>
          <Label>{preset?.apiKeyLabel ?? 'API key'}</Label>
          <Input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder={config.presetId === 'ollama' ? 'Optional for local Ollama' : 'sk-…'}
            autoComplete="off"
          />
          {preset?.docsUrl && (
            <a
              href={preset.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {preset.docsLabel ?? 'Documentation'}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <div>
          <Label>Model</Label>
          <Input
            value={config.model}
            onChange={(e) => setConfig({ ...config, model: e.target.value })}
            placeholder="gemini-2.0-flash"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.redactSensitiveIds}
            onChange={(e) => setConfig({ ...config, redactSensitiveIds: e.target.checked })}
          />
          Redact account / policy / folio numbers from portfolio context
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void handleTest()} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Test connection
          </Button>
          <Button type="button" variant="ghost" onClick={handleClearKeys}>
            Clear keys &amp; history
          </Button>
        </div>

        {testStatus && (
          <p
            className={`text-sm ${testStatus.ok ? 'text-success' : 'text-destructive'}`}
            role="status"
          >
            {testStatus.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Cloud APIs (OpenAI, Anthropic) may block browser requests due to CORS. Gemini, OpenRouter,
          and local Ollama usually work best. Ollama: set{' '}
          <code className="rounded bg-muted px-1">OLLAMA_ORIGINS=*</code> before starting the server.
        </p>
      </CardContent>
    </Card>
  );
}
