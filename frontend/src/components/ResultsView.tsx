import { useState } from 'react';
import type { FileItem } from '../types';
import type { Translations } from '../i18n/translations';
import { CheckCircleIcon, XCircleIcon, FolderOpenIcon } from './Icons';
import { createZip, revealInFolder } from '../services/tauriCommands';
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
  const [zipPath, setZipPath] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const handleDownloadZip = async () => {
    const outputPaths = successFiles
      .map((f) => f.outputPath)
      .filter((p): p is string => !!p);
    if (outputPaths.length === 0) return;

    const firstDir = getDirectory(outputPaths[0]);
    const zipOutput = `${firstDir}/MdConverter_output.zip`;

    setZipping(true);
    try {
      const result = await createZip(outputPaths, zipOutput);
      setZipPath(result);
    } catch (e) {
      console.error('Failed to create zip:', e);
    }
    setZipping(false);
  };

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

      <div className={styles.bottomActions}>
        {successFiles.length > 1 && (
          <button
            className={styles.zipBtn}
            onClick={zipPath ? () => revealInFolder(zipPath) : handleDownloadZip}
            disabled={zipping}
          >
            {zipping
              ? '...'
              : zipPath
                ? t.zipCreated
                : t.downloadZip}
          </button>
        )}
        <button className={styles.resetBtn} onClick={onReset}>
          {t.convertMoreFiles}
        </button>
      </div>
    </div>
  );
}
