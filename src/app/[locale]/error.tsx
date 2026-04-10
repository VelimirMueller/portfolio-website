'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Home, FolderOpen, Mail, RefreshCw } from 'lucide-react';
import { AnimateIn } from '@/components/atoms/AnimateIn';

const links = [
  { key: 'home' as const, href: '/', icon: Home },
  { key: 'projects' as const, href: '/projects', icon: FolderOpen },
  { key: 'contact' as const, href: '/contact', icon: Mail },
];

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-500/[0.06] blur-3xl" />
      </div>

      <AnimateIn from="bottom">
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-2xl text-red-500">!</span>
          </div>

          <h1 className="text-xl md:text-2xl font-medium text-black dark:text-white">
            {t('errorPage.heading')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-md mx-auto leading-relaxed">
            {t('errorPage.description')}
          </p>

          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <RefreshCw size={14} />
            {t('errorPage.retry')}
          </button>

          <div className="flex gap-6 justify-center mt-8">
            {links.map(({ key, href, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-11 h-11 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:border-brand-500 group-hover:bg-brand-500/5 transition-all">
                  <Icon size={18} className="text-gray-500 group-hover:text-brand-500 transition-colors" />
                </div>
                <span className="text-[11px] font-mono text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                  {t(`errorPage.${key}`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </AnimateIn>
    </div>
  );
}
