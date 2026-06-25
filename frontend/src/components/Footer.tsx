import type { Translations } from '../i18n/translations';
import { GithubIcon, LinkedinIcon } from './Icons';
import styles from './Footer.module.css';

interface FooterProps {
  t: Translations;
}

export function Footer({ t }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <span className={styles.credit}>
        {t.builtBy} <strong>Alexander Calambas</strong>
      </span>
      <div className={styles.links}>
        <a
          href="https://github.com/JhojanAlexanderCalambasRamirez"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          title="GitHub"
        >
          <GithubIcon size={16} />
        </a>
        <a
          href="https://www.linkedin.com/in/j4cr/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          title="LinkedIn"
        >
          <LinkedinIcon size={16} />
        </a>
      </div>
    </footer>
  );
}
