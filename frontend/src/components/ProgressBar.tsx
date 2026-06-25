import type { Translations } from '../i18n/translations';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  completed: number;
  total: number;
  isConverting: boolean;
  t: Translations;
}

export function ProgressBar({ completed, total, isConverting, t }: ProgressBarProps) {
  if (!isConverting || total === 0) return null;

  const percent = Math.round((completed / total) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span className={styles.label}>{t.convertingProgress}</span>
        <span className={styles.count}>{completed}/{total}</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
