'use client';

import React from 'react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { useLanguage, useTranslationArray } from '@/components/language/LanguageProvider';

export default function PrivacyPage() {
  const { t } = useLanguage();
  const s3Data = useTranslationArray('privacy.s3Data');
  const s6Rights = useTranslationArray('privacy.s6Rights');

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <SectionHeader title={t('privacy.title')} subtitle={t('privacy.subtitle')} />

      <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/10 space-y-10">

        {/* 1. Verantwortlicher */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s1Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s1Text')}</p>
          <div className="text-gray-600 dark:text-gray-400 text-sm font-mono space-y-1">
            <p className="font-bold text-black dark:text-white">Velimir Müller</p>
            <p>C/O RYSE Group GmbH</p>
            <p>Wildenbruchstraße 69</p>
            <p>12045 Berlin</p>
            <p className="mt-3">E-Mail: velimir.mueller@googlemail.com</p>
          </div>
        </section>

        {/* 2. Allgemeine Hinweise */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s2Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{t('privacy.s2Text')}</p>
        </section>

        {/* 3. Kontaktformular */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s3Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s3Text')}</p>

          <p className="text-sm font-bold text-black dark:text-white mb-2">{t('privacy.s3DataTitle')}</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm mb-4 space-y-1">
            {s3Data.map((item, i) => <li key={i}>{item}</li>)}
          </ul>

          <p className="text-sm font-bold text-black dark:text-white mb-1">{t('privacy.s3Purpose')}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s3PurposeText')}</p>

          <p className="text-sm font-bold text-black dark:text-white mb-1">{t('privacy.s3Legal')}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s3LegalText')}</p>
        </section>

        {/* 4. Speicherung */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s4Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s4Text')}</p>

          <p className="text-sm font-bold text-black dark:text-white mb-1">{t('privacy.s4Provider')}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s4ProviderText')}</p>

          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s4Detail')}</p>
        </section>

        {/* 5. Speicherdauer */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s5Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s5Text')}</p>
        </section>

        {/* 6. Ihre Rechte */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s6Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{t('privacy.s6Text')}</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1 mb-4">
            {s6Rights.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s6Contact')}</p>
        </section>

        {/* 7. Beschwerderecht */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s7Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s7Text')}</p>
        </section>

        {/* 8. SSL */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s8Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s8Text')}</p>
        </section>

      </div>
    </div>
  );
}
