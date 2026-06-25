import { useEffect, useState } from 'react';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { selectFiles } from '../services/fileDialog';
import type { Translations } from '../i18n/translations';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFilesAdded: (paths: string[]) => void;
  disabled?: boolean;
  compact?: boolean;
  t: Translations;
}

export function DropZone({ onFilesAdded, disabled, compact, t }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const unlisten = getCurrentWebview().onDragDropEvent((event) => {
      if (disabled) return;
      if (event.payload.type === 'enter') {
        setIsDragging(true);
      } else if (event.payload.type === 'drop') {
        setIsDragging(false);
        if (event.payload.paths) {
          onFilesAdded(event.payload.paths);
        }
      } else if (event.payload.type === 'leave') {
        setIsDragging(false);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onFilesAdded, disabled]);

  const handleClick = async () => {
    if (disabled) return;
    const paths = await selectFiles();
    if (paths) {
      onFilesAdded(paths);
    }
  };

  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${compact ? styles.compact : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
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
          {isDragging ? t.dropHere : t.dragAndDrop}
        </p>
        <p className={styles.subtext}>{t.orClickToBrowse}</p>
      </div>
    </div>
  );
}
