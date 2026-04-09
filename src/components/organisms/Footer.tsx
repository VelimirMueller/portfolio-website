'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Mail, Linkedin, Github } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations();

  return (
    <footer className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-t border-black/5 dark:border-white/5 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        <div className="md:col-span-2">
          <h3 className="font-mono font-bold text-xl text-black dark:text-white mb-3">Velimir Müller</h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            {t('footer.tagline')}<br/>
            <span className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">{t('footer.taglineSecondary')}</span><br/>
            <span className="text-gray-600 dark:text-gray-400">{t('footer.taglineDesc')}</span>
          </p>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase text-gray-500 mb-4 tracking-widest">{t('footer.sitemap')}</h4>
          <ul className="space-y-2 text-sm font-mono text-gray-500 dark:text-gray-400">
            <li><Link href="/services" className="hover:text-black dark:hover:text-white transition-colors duration-200">{t('footer.services')}</Link></li>
            <li><Link href="/projects" className="hover:text-black dark:hover:text-white transition-colors duration-200">{t('footer.projects')}</Link></li>
            <li><Link href="/about" className="hover:text-black dark:hover:text-white transition-colors duration-200">{t('footer.about')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase text-gray-500 mb-4 tracking-widest">{t('footer.connect')}</h4>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/in/velimir-müller-07b460175" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="w-10 h-10 rounded-full bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              <Linkedin size={18} aria-hidden="true" />
            </a>
            <a href="https://github.com/VelimirMueller" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="w-10 h-10 rounded-full bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              <Github size={18} aria-hidden="true" />
            </a>
            <a href="mailto:velimir.mueller@googlemail.com" aria-label="Send email" className="w-10 h-10 rounded-full bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              <Mail size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono gap-2">
        <span>© {new Date().getFullYear()} Velimir Müller.</span>
        <div className="flex gap-4">
          <Link href="/imprint" className="hover:text-black dark:hover:text-white transition-colors duration-200">{t('footer.imprint')}</Link>
          <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors duration-200">{t('footer.privacy')}</Link>
        </div>
        <span>{t('footer.builtWith')}</span>
      </div>
    </footer>
  );
};
