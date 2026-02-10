'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Palette, Laptop, Rocket, Wrench } from 'lucide-react';
import { BentoCard } from '@/components/molecules/BentoCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { useLanguage, useTranslationArray } from '@/components/language/LanguageProvider';

export default function ServicesPage() {
  const { t } = useLanguage();
  const valueItems = useTranslationArray('services.valueItems');

  const serviceLinks = [
    { key: 'requirementsEngineering', icon: ClipboardList, path: "/services/requirements-engineering" },
    { key: 'uxUiBranding', icon: Palette, path: "/services/ux-ui-branding" },
    { key: 'frontendDevelopment', icon: Laptop, path: "/services/frontend-development" },
    { key: 'projectDelivery', icon: Rocket, path: "/services/project-delivery" },
    { key: 'modernStack', icon: Wrench, path: "/services/modern-stack" },
  ];

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('services.title')} subtitle={t('services.subtitle')} />
      </AnimateIn>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        <AnimateIn from="left" delay={100} className="md:col-span-12 lg:col-span-8">
        <BentoCard className="bg-zinc-200 dark:bg-zinc-900 min-h-[400px]" title={t('services.heroTitle')}>
           <div className="mt-6 grid md:grid-cols-2 gap-12">
             <div className="flex flex-col justify-between">
                <p className="text-lg font-medium leading-relaxed mb-8 text-zinc-800 dark:text-zinc-200">
                  {t('services.heroDesc')} <strong className="text-zinc-900 dark:text-white">{t('services.heroDescBold')}</strong>{t('services.heroDescAfter')}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
                    <ClipboardList className="text-zinc-900 dark:text-zinc-100" size={20} />
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('services.pipeline1')}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
                    <Rocket className="text-zinc-900 dark:text-zinc-100" size={20} />
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('services.pipeline2')}</span>
                  </div>
                </div>
             </div>

             <div className="bg-white dark:bg-[#111] rounded-xl p-6 border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none">
                <h4 className="font-mono text-xs uppercase tracking-widest mb-6 font-bold text-gray-500 dark:text-gray-400">{t('services.valueAdd')}</h4>
                <ul className="space-y-4">
                  {valueItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-800 dark:text-zinc-200">
                      <div className="mt-1 min-w-[16px] h-4 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-mono">&#10003;</div>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                  <Button to="/contact" className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-transparent">
                    {t('services.checkAvailability')}
                  </Button>
                </div>
             </div>
           </div>
        </BentoCard>
        </AnimateIn>

        <AnimateIn from="right" delay={200} className="md:col-span-12 lg:col-span-4">
        <div className="flex flex-col gap-4">
           <div className="bg-white dark:bg-[#111] p-6 rounded-[1.5rem] border border-black/5 dark:border-white/10">
              <h3 className="text-xl font-bold text-black dark:text-white mb-6">{t('services.detailTitle')}</h3>
              <div className="space-y-4">
                 {serviceLinks.map((service, i) => (
                   <Link
                     key={i}
                     href={service.path}
                     className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all group"
                   >
                      <div className="p-2 bg-white dark:bg-[#050505] rounded-lg text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors border border-black/5 dark:border-white/5">
                         <service.icon size={18} />
                      </div>
                      <div className="flex-1">
                         <div className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">{t(`services.serviceNames.${service.key}`)}</div>
                      </div>
                      <ArrowRight size={14} className="text-gray-400 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                   </Link>
                 ))}
              </div>
           </div>
        </div>
        </AnimateIn>

      </div>
    </div>
  );
}
