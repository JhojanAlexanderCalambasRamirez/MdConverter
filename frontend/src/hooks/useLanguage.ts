import { useState, useMemo } from 'react';
import { type Language, type Translations, getTranslations } from '../i18n/translations';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('mdconverter-lang') as Language) || 'en';
  });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'es' : 'en';
      localStorage.setItem('mdconverter-lang', next);
      return next;
    });
  };

  const t: Translations = useMemo(() => getTranslations(language), [language]);

  return { language, toggleLanguage, t };
}
