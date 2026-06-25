import { useState, useCallback } from 'react';
import type { FileItem, FileStatus } from '../types';

export function useFileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const addFiles = useCallback((paths: string[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.path));
      const newFiles: FileItem[] = paths
        .filter((p) => !existing.has(p))
        .map((path) => {
          const name = path.split(/[/\\]/).pop() || path;
          const ext = name.split('.').pop()?.toLowerCase() || '';
          return {
            id: crypto.randomUUID(),
            path,
            name,
            extension: ext,
            status: 'pending' as FileStatus,
          };
        });
      return [...prev, ...newFiles];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileStatus = useCallback(
    (id: string, status: FileStatus, extra?: Partial<FileItem>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status, ...extra } : f))
      );
    },
    []
  );

  const clearAll = useCallback(() => setFiles([]), []);

  return { files, addFiles, removeFile, updateFileStatus, clearAll };
}
