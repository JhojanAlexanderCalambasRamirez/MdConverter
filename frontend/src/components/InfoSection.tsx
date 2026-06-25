import { useState } from 'react';
import type { Translations } from '../i18n/translations';
import { InfoIcon } from './Icons';
import styles from './InfoSection.module.css';

interface InfoSectionProps {
  t: Translations;
}

export function InfoSection({ t }: InfoSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <InfoIcon size={16} />
        <span>{isOpen ? t.hideInfo : t.whatIsThis}</span>
      </button>

      {isOpen && (
        <div className={styles.content}>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{t.aboutTitle}</h3>
            <p className={styles.blockText}>{t.aboutText}</p>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{t.howToUseTitle}</h3>
            <ol className={styles.steps}>
              <li dangerouslySetInnerHTML={{ __html: t.step1 }} />
              <li dangerouslySetInnerHTML={{ __html: t.step2 }} />
              <li dangerouslySetInnerHTML={{ __html: t.step3 }} />
              <li dangerouslySetInnerHTML={{ __html: t.step4 }} />
              <li dangerouslySetInnerHTML={{ __html: t.step5 }} />
            </ol>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{t.supportedFormatsTitle}</h3>
            <div className={styles.formats}>
              <span className={styles.format}>PDF</span>
              <span className={styles.format}>DOCX</span>
              <span className={styles.format}>XLSX</span>
              <span className={styles.format}>PPTX</span>
              <span className={styles.format}>CSV</span>
              <span className={styles.format}>HTML</span>
              <span className={styles.format}>TXT</span>
              <span className={styles.format}>JSON</span>
              <span className={styles.format}>XML</span>
              <span className={styles.format}>EPUB</span>
            </div>
          </div>

          <div className={styles.block}>
            <p className={styles.engine}>
              {t.poweredBy}{' '}
              <a
                href="https://github.com/microsoft/markitdown"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                MarkItDown
              </a>{' '}
              {t.fromMicrosoft}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
