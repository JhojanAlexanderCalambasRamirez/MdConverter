import type { Theme } from '../types';
import type { Translations } from '../i18n/translations';
import { SunIcon, MoonIcon, MonitorIcon } from './Icons';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  t: Translations;
}

const THEME_CYCLE: Theme[] = ['light', 'dark', 'system'];

function ThemeIcon({ theme }: { theme: Theme }) {
  switch (theme) {
    case 'light':
      return <SunIcon size={16} />;
    case 'dark':
      return <MoonIcon size={16} />;
    case 'system':
      return <MonitorIcon size={16} />;
  }
}

export function ThemeToggle({ theme, onThemeChange, t }: ThemeToggleProps) {
  const next = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    onThemeChange(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  return (
    <button className={styles.toggle} onClick={next} title={t.themeLabel(theme)}>
      <ThemeIcon theme={theme} />
    </button>
  );
}
