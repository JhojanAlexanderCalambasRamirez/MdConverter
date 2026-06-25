import { useFileManager } from './hooks/useFileManager';
import { useConverter } from './hooks/useConverter';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { revealInFolder } from './services/tauriCommands';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { ProgressBar } from './components/ProgressBar';
import { ConversionActions } from './components/ConversionActions';
import { ResultsView } from './components/ResultsView';
import { ThemeToggle } from './components/ThemeToggle';
import { InfoSection } from './components/InfoSection';
import { Footer } from './components/Footer';
import styles from './components/ThemeToggle.module.css';

function App() {
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { files, addFiles, removeFile, updateFileStatus, clearAll } =
    useFileManager();
  const { isConverting, completed, startConversion } = useConverter(
    files,
    updateFileStatus
  );

  const allDone =
    files.length > 0 &&
    files.every((f) => f.status === 'success' || f.status === 'error');
  const pendingCount = files.filter((f) => f.status === 'pending').length;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{t.appTitle}</h1>
        <div className="app-header-actions">
          <button
            className={styles.langToggle}
            onClick={toggleLanguage}
            title={language === 'en' ? 'Cambiar a Espanol' : 'Switch to English'}
          >
            {t.langLabel}
          </button>
          <ThemeToggle theme={theme} onThemeChange={setTheme} t={t} />
        </div>
      </header>

      <main className="app-main">
        {files.length === 0 ? (
          <>
            <DropZone onFilesAdded={addFiles} disabled={isConverting} t={t} />
            <InfoSection t={t} />
          </>
        ) : allDone ? (
          <ResultsView
            files={files}
            onRevealInFolder={revealInFolder}
            onReset={clearAll}
            t={t}
          />
        ) : (
          <>
            <DropZone
              onFilesAdded={addFiles}
              disabled={isConverting}
              compact
              t={t}
            />
            <FileList files={files} onRemoveFile={removeFile} t={t} />
            <ProgressBar
              completed={completed}
              total={pendingCount}
              isConverting={isConverting}
              t={t}
            />
            <ConversionActions
              files={files}
              isConverting={isConverting}
              onConvert={startConversion}
              onClearAll={clearAll}
              t={t}
            />
          </>
        )}
      </main>

      <Footer t={t} />
    </div>
  );
}

export default App;
