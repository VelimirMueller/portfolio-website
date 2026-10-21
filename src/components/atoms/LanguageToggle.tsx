'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export const LanguageToggle = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === 'de' ? 'en' : 'de';
  const label = otherLocale.toUpperCase();
  // The accessible name starts with the visible text (WCAG 2.5.3 Label in Name).
  const hint = locale === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln';

  const handleLanguageToggle = () => {
    router.replace(pathname, { locale: otherLocale });
  };

  return (
    <button
      onClick={handleLanguageToggle}
      className="w-9 h-9 flex items-center justify-center rounded-full text-light-sub dark:text-dark-sub hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-mono text-xs font-bold tracking-tight"
      aria-label={`${label} – ${hint}`}
      data-track={`nav:language-${otherLocale}`}
    >
      {label}
    </button>
  );
};
