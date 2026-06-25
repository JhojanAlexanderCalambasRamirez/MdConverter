import type { FileItem } from '../types';
import type { Translations } from '../i18n/translations';
import { CheckCircleIcon, XCircleIcon, FolderOpenIcon } from './Icons';
import styles from './ResultsView.module.css';

interface ResultsViewProps {
  files: FileItem[];
  onRevealInFolder: (path: string) => void;
  onReset: () => void;
  t: Translations;
}

function getDirectory(path: string): string {
  const parts = path.split(/[/\\]/);
  parts.pop();
  return parts.join('/') || parts.join('\\');
}

export function ResultsView({ files, onRevealInFolder, onReset, t }: ResultsViewProps) {
  const successFiles = files.filter((f) => f.status === 'success');
  const errorFiles = files.filter((f) => f.status === 'error');

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <CheckCircleIcon size={40} className={styles.summaryIcon} />
        <h2 className={styles.title}>{t.conversionComplete}</h2>
        <div className={styles.stats}>
          {successFiles.length > 0 && (
            <span className={styles.successStat}>
              {t.converted(successFiles.length)}
            </span>
          )}
          {errorFiles.length > 0 && (
            <span className={styles.errorStat}>
              {t.failed(errorFiles.length)}
            </span>
          )}
        </div>
        {successFiles.length > 0 && (
          <p className={styles.exportMsg}>{t.exportedTo}</p>
        )}
      </div>

      <div className={styles.results}>
        {successFiles.map((file) => (
          <div key={file.id} className={styles.resultItem}>
            <div className={styles.resultInfo}>
              <CheckCircleIcon size={16} className={styles.resultIcon} />
              <div className={styles.resultText}>
                <span className={styles.resultName}>{file.name}</span>
                {file.outputPath && (
                  <>
                    <span className={styles.resultOutputName}>
                      {file.outputPath.split(/[/\\]/).pop()}
                    </span>
                    <span className={styles.resultPath}>
                      {getDirectory(file.outputPath)}
                    </span>
                  </>
                )}
              </div>
            </div>
            {file.outputPath && (
              <div className={styles.actions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => onRevealInFolder(file.outputPath!)}
                >
                  <FolderOpenIcon size={14} />
                  <span>{t.viewFile}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {errorFiles.map((file) => (
          <div key={file.id} className={`${styles.resultItem} ${styles.errorItem}`}>
            <div className={styles.resultInfo}>
              <XCircleIcon size={16} className={styles.errorIconInline} />
              <div className={styles.resultText}>
                <span className={styles.resultName}>{file.name}</span>
                <span className={styles.errorMsg}>{file.error}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.resetBtn} onClick={onReset}>
        {t.convertMoreFiles}
      </button>
    </div>
  );
}
