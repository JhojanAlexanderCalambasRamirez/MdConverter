import type { FileItem } from '../types';
import type { Translations } from '../i18n/translations';
import {
  FileIcon,
  FileTextIcon,
  TableIcon,
  PresentationIcon,
  GlobeIcon,
  CodeIcon,
  BookIcon,
  CircleIcon,
  LoaderIcon,
  CheckCircleIcon,
  XCircleIcon,
  XIcon,
} from './Icons';
import styles from './FileList.module.css';

interface FileListProps {
  files: FileItem[];
  onRemoveFile: (id: string) => void;
  t: Translations;
}

function FileTypeIcon({ ext }: { ext: string }) {
  const props = { size: 18 };
  switch (ext) {
    case 'pdf':
    case 'docx':
    case 'doc':
      return <FileTextIcon {...props} />;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <TableIcon {...props} />;
    case 'pptx':
    case 'ppt':
      return <PresentationIcon {...props} />;
    case 'html':
    case 'htm':
      return <GlobeIcon {...props} />;
    case 'json':
    case 'xml':
      return <CodeIcon {...props} />;
    case 'epub':
      return <BookIcon {...props} />;
    default:
      return <FileIcon {...props} />;
  }
}

function StatusIcon({ status }: { status: FileItem['status'] }) {
  switch (status) {
    case 'pending':
      return <CircleIcon size={16} className={styles.status_pending} />;
    case 'converting':
      return <LoaderIcon size={16} className={styles.status_converting} />;
    case 'success':
      return <CheckCircleIcon size={16} className={styles.status_success} />;
    case 'error':
      return <XCircleIcon size={16} className={styles.status_error} />;
  }
}

export function FileList({ files, onRemoveFile, t }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.count}>{t.fileCount(files.length)}</span>
      </div>
      <div className={styles.list}>
        {files.map((file) => (
          <div key={file.id} className={`${styles.item} ${styles[file.status]}`}>
            <span className={styles.fileIcon}>
              <FileTypeIcon ext={file.extension} />
            </span>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{file.name}</span>
              {file.error && (
                <span className={styles.errorText}>{file.error}</span>
              )}
            </div>
            <span className={styles.statusIcon}>
              <StatusIcon status={file.status} />
            </span>
            {file.status === 'pending' && (
              <button
                className={styles.removeBtn}
                onClick={() => onRemoveFile(file.id)}
                title="Remove"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
