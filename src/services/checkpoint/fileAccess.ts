import { defaultCheckpointFilename } from './serialize';

type FileSystemWindow = Window & {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle>;
};

const CHECKPOINT_TYPES = [
  {
    description: 'Finance Tracker Checkpoint',
    accept: { 'application/json': ['.ftcheckpoint', '.json'] },
  },
];

export async function saveCheckpointToFile(
  content: string,
  suggestedName?: string,
): Promise<void> {
  const filename = suggestedName ?? defaultCheckpointFilename();
  const win = window as FileSystemWindow;

  if (win.showSaveFilePicker) {
    try {
      const handle = await win.showSaveFilePicker({
        suggestedName: filename,
        types: CHECKPOINT_TYPES,
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function loadCheckpointFromFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ftcheckpoint,.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      try {
        const text = await file.text();
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    input.click();
  });
}
