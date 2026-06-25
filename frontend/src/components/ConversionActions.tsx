import type { FileItem } from '../types';
import type { Translations } from '../i18n/translations';
import styles from './ConversionActions.module.css';

interface ConversionActionsProps {
  files: FileItem[];
  isConverting: boolean;
  onConvert: () => void;
  onClearAll: () => void;
  t: Translations;
}

export function ConversionActions({
  files,
  isConverting,
  onConvert,
  onClearAll,
  t,
}: ConversionActionsProps) {
  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const hasFiles = files.length > 0;

  return (
    <div className={styles.container}>
      <button
        className={styles.convertBtn}
        onClick={onConvert}
        disabled={!hasFiles || pendingCount === 0 || isConverting}
      >
        {isConverting
          ? t.converting
          : pendingCount > 0
            ? t.convertWith(pendingCount)
            : t.convert}
      </button>
      <button
        className={styles.clearBtn}
        onClick={onClearAll}
        disabled={!hasFiles || isConverting}
      >
        {t.clearAll}
      </button>
    </div>
  );
}
