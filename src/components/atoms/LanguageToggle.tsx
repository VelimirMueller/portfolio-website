'use client';

import { useLanguage } from '@/components/language/LanguageProvider';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="w-9 h-9 flex items-center justify-center rounded-full text-light-sub dark:text-dark-sub hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-mono text-xs font-bold tracking-tight"
      aria-label={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
    >
      {language === 'de' ? 'EN' : 'DE'}
    </button>
  );
};
