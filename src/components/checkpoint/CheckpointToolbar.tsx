import { useFinanceStore } from '@/store/financeStore';
import { serializeState, deserializeState, checkpointSummary } from '@/services/checkpoint/serialize';
import { loadCheckpointFromFile, saveCheckpointToFile } from '@/services/checkpoint/fileAccess';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Save, FilePlus, RotateCcw } from 'lucide-react';

export function CheckpointToolbar() {
  const state = useFinanceStore((s) => s.state);
  const isDirty = useFinanceStore((s) => s.isDirty);
  const loadedFileName = useFinanceStore((s) => s.loadedFileName);
  const setState = useFinanceStore((s) => s.setState);
  const markClean = useFinanceStore((s) => s.markClean);
  const resetToEmpty = useFinanceStore((s) => s.resetToEmpty);
  const showToast = useFinanceStore((s) => s.showToast);

  const handleLoad = async () => {
    if (isDirty && !confirm('You have unsaved changes. Load anyway?')) return;
    try {
      const json = await loadCheckpointFromFile();
      const loaded = deserializeState(json);
      setState(loaded);
      markClean('checkpoint.ftcheckpoint');
      showToast(checkpointSummary(loaded));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load checkpoint');
    }
  };

  const handleSave = async (saveAs = false) => {
    try {
      const json = serializeState(state);
      await saveCheckpointToFile(json, saveAs ? undefined : loadedFileName ?? undefined);
      markClean(loadedFileName ?? 'checkpoint.ftcheckpoint');
      showToast('Checkpoint saved successfully');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save checkpoint');
    }
  };

  const handleNew = () => {
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    if (!confirm('Start with empty data?')) return;
    resetToEmpty();
    showToast('Started new empty checkpoint');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleLoad}>
        <FolderOpen className="h-4 w-4" />
        <span className="hidden sm:inline">Load</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleSave(false)}>
        <Save className="h-4 w-4" />
        <span className="hidden sm:inline">Save</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleSave(true)}>
        <FilePlus className="h-4 w-4" />
        <span className="hidden sm:inline">Save As</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={handleNew}>
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
      </Button>
      {isDirty ? (
        <Badge variant="warning">Unsaved changes</Badge>
      ) : loadedFileName ? (
        <Badge variant="success">Saved</Badge>
      ) : null}
    </div>
  );
}
