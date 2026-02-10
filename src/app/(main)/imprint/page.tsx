'use client';

import React from 'react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { useLanguage } from '@/components/language/LanguageProvider';

export default function ImprintPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <SectionHeader title={t('imprint.title')} subtitle={t('imprint.subtitle')} />

      <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/10">
        <h2 className="text-xl font-mono font-bold text-black dark:text-white mb-8">
          {t('imprint.address')}
        </h2>
        <div className="text-gray-600 dark:text-gray-400 space-y-1 font-mono text-sm">
          <p className="font-bold text-black dark:text-white">C/O RYSE Group GmbH</p>
          <p>Wildenbruchstraße 69</p>
          <p>12045 Berlin</p>
        </div>
      </div>
    </div>
  );
}
