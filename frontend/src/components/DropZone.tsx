import { useEffect, useState } from 'react';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { selectFiles, selectFolder } from '../services/fileDialog';
import { listFolderFiles } from '../services/tauriCommands';
import type { Translations } from '../i18n/translations';
import { FolderOpenIcon } from './Icons';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFilesAdded: (paths: string[]) => void;
  disabled?: boolean;
  compact?: boolean;
  t: Translations;
}

async function resolvePaths(paths: string[]): Promise<string[]> {
  const allFiles: string[] = [];
  for (const p of paths) {
    try {
      const folderFiles = await listFolderFiles(p);
      allFiles.push(...folderFiles);
    } catch {
      allFiles.push(p);
    }
  }
  return allFiles;
}

export function DropZone({ onFilesAdded, disabled, compact, t }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unlisten = getCurrentWebview().onDragDropEvent(async (event) => {
      if (disabled || isLoading) return;
      if (event.payload.type === 'enter') {
        setIsDragging(true);
      } else if (event.payload.type === 'drop') {
        setIsDragging(false);
        if (event.payload.paths) {
          setIsLoading(true);
          const files = await resolvePaths(event.payload.paths);
          if (files.length > 0) onFilesAdded(files);
          setIsLoading(false);
        }
      } else if (event.payload.type === 'leave') {
        setIsDragging(false);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onFilesAdded, disabled, isLoading]);

  const handleClickFiles = async () => {
    if (disabled || isLoading) return;
    const paths = await selectFiles();
    if (paths) onFilesAdded(paths);
  };

  const handleClickFolder = async () => {
    if (disabled || isLoading) return;
    const folder = await selectFolder();
    if (!folder) return;
    setIsLoading(true);
    try {
      const files = await listFolderFiles(folder);
      if (files.length > 0) onFilesAdded(files);
    } catch (e) {
      console.error('Failed to scan folder:', e);
    }
    setIsLoading(false);
  };

  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${compact ? styles.compact : ''} ${disabled || isLoading ? styles.disabled : ''}`}
      onClick={handleClickFiles}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 8L24 32M24 8L16 16M24 8L32 16"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 28V36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36V28"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className={styles.text}>
          {isLoading ? t.loadingFolder : isDragging ? t.dropHere : t.dragAndDrop}
        </p>
        <p className={styles.subtext}>{t.orClickToBrowse}</p>
        <button
          className={styles.folderBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleClickFolder();
          }}
          disabled={disabled || isLoading}
        >
          <FolderOpenIcon size={14} />
          <span>{t.selectFolder}</span>
        </button>
      </div>
    </div>
  );
}
