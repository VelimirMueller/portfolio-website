'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useLanguage } from '@/components/language/LanguageProvider';
import { LanguageToggle } from '@/components/atoms/LanguageToggle';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() ?? '/';
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { path: '/', label: t('nav.home'), mobileLabel: `// ${t('nav.home')}`, mobileDesc: t('nav.homeDesc') },
    {
      path: '/services',
      label: t('nav.services'),
      mobileLabel: `// ${t('nav.services')}`,
      mobileDesc: t('nav.servicesDesc'),
      children: [
        { path: '/services/requirements-engineering', label: t('nav.children.requirementsEngineering') },
        { path: '/services/ux-ui-branding', label: t('nav.children.uxUiBranding') },
        { path: '/services/frontend-development', label: t('nav.children.frontendDevelopment') },
        { path: '/services/project-delivery', label: t('nav.children.projectDelivery') },
        { path: '/services/modern-stack', label: t('nav.children.modernStack') },
      ]
    },
    { path: '/projects', label: t('nav.projects'), mobileLabel: `// ${t('nav.projects')}`, mobileDesc: t('nav.projectsDesc') },
    { path: '/about', label: t('nav.about'), mobileLabel: `// ${t('nav.about')}`, mobileDesc: t('nav.aboutDesc') },
  ];

  return (
    <>
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border border-light-border dark:border-dark-border rounded-full p-1.5 flex items-center shadow-2xl dark:shadow-none relative transition-all duration-300">
          <Link href="/" className="pl-4 pr-6 py-2 flex items-center gap-3 group border-r border-light-border dark:border-dark-border mr-1">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-bold font-mono text-xs group-hover:scale-110 transition-transform shadow-lg">VM</div>
            <span className="font-mono font-bold text-sm tracking-tight text-light-text dark:text-dark-text hidden sm:block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Velimir Müller</span>
          </Link>

          <div className="hidden md:flex items-center mx-1">
            {navItems.map((item) => (
              <div key={item.path} className="relative group">
                <Link
                  href={item.path}
                  className={`px-5 py-2.5 rounded-full text-xs font-mono transition-all flex items-center gap-1 ${
                    isActive(item.path)
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                      : 'text-light-sub dark:text-dark-sub hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true" />}
                </Link>

                {item.children && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-[#18181b] border border-light-border dark:border-dark-border rounded-xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block px-4 py-2.5 text-xs font-mono rounded-lg transition-colors ${
                          isActive(child.path)
                           ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white font-bold'
                           : 'text-light-sub dark:text-dark-sub hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pl-1 pr-1.5 hidden md:flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full text-light-sub dark:text-dark-sub hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label={t('nav.toggleTheme')}
            >
              {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
            <Button to="/contact" variant="primary" className="!px-5 !py-2 !text-xs !h-9 bg-brand-600 hover:bg-brand-700 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-none shadow-lg shadow-brand-500/20 dark:shadow-white/10">
              {t('nav.contact')}
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden pl-2">
            <LanguageToggle />
            <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
              {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <button onClick={() => setIsOpen(true)} className="p-3 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full" aria-label={t('nav.openMenu')}>
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label="Navigation menu" className="fixed inset-0 bg-light-bg dark:bg-dark-bg z-[60] flex flex-col p-6 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-y-auto">
          <div className="flex justify-end mb-8">
            <button onClick={() => setIsOpen(false)} className="p-2 bg-white dark:bg-[#121214] rounded-full text-black dark:text-white border border-light-border dark:border-dark-border" aria-label={t('nav.closeMenu')}>
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {navItems.map((link) => (
              <React.Fragment key={link.path}>
                <Link
                  href={link.path}
                  className="group p-4 border-b border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="text-3xl font-mono font-bold text-light-text dark:text-dark-text mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors">{link.mobileLabel}</div>
                  <div className="text-gray-500 text-xs font-mono uppercase tracking-widest">{link.mobileDesc}</div>
                </Link>

                {link.children && (
                   <div className="pl-8 flex flex-col border-b border-light-border dark:border-dark-border">
                      {link.children.map(child => (
                         <Link
                            key={child.path}
                            href={child.path}
                            className="py-3 text-sm font-mono text-light-sub dark:text-dark-sub hover:text-black dark:hover:text-white flex items-center gap-2"
                         >
                            <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" aria-hidden="true"></div>
                            {child.label}
                         </Link>
                      ))}
                   </div>
                )}
              </React.Fragment>
            ))}
            <Link
              href="/contact"
              className="group p-4 border-b border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-3xl font-mono font-bold text-light-text dark:text-dark-text mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors">{`// ${t('nav.contact')}`}</div>
              <div className="text-gray-500 text-xs font-mono uppercase tracking-widest">{t('nav.contactDesc')}</div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
