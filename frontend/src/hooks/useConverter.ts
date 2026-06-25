import { useState, useCallback, useRef } from 'react';
import { convertFile } from '../services/tauriCommands';
import type { FileItem, FileStatus } from '../types';

export function useConverter(
  files: FileItem[],
  updateFileStatus: (
    id: string,
    status: FileStatus,
    extra?: Partial<FileItem>
  ) => void
) {
  const [isConverting, setIsConverting] = useState(false);
  const [completed, setCompleted] = useState(0);
  const filesRef = useRef(files);
  filesRef.current = files;

  const startConversion = useCallback(async () => {
    const pendingFiles = filesRef.current.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsConverting(true);
    setCompleted(0);

    for (const file of pendingFiles) {
      updateFileStatus(file.id, 'converting');

      try {
        const result = await convertFile(file.path);
        if (result.status === 'success') {
          updateFileStatus(file.id, 'success', {
            outputPath: result.outputPath ?? undefined,
            title: result.title ?? undefined,
          });
        } else {
          updateFileStatus(file.id, 'error', {
            error: result.error ?? 'Unknown error',
          });
        }
      } catch (err) {
        updateFileStatus(file.id, 'error', {
          error: err instanceof Error ? err.message : String(err),
        });
      }

      setCompleted((prev) => prev + 1);
    }

    setIsConverting(false);
  }, [updateFileStatus]);

  return { isConverting, completed, startConversion };
}
