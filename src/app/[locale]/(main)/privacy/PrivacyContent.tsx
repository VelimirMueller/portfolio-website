import React from 'react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { useTranslations } from 'next-intl';
import { LEGAL_CONTACT, SUPERVISORY_AUTHORITY } from '@/config/legal';

/** One processing activity: what happens, who does it, and on which legal basis. */
function ProcessingSection({ id }: { id: 'hosting' | 'captcha' | 'mail' | 'analytics' | 'storage' }) {
  const t = useTranslations();
  const provider = t(`privacy.${id}.provider`);
  return (
    <section>
      <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t(`privacy.${id}.title`)}</h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t(`privacy.${id}.text`)}</p>
      {provider && (
        <>
          <p className="text-sm font-bold text-black dark:text-white mb-1">{provider}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t(`privacy.${id}.providerText`)}</p>
        </>
      )}
      <p className="text-sm font-bold text-black dark:text-white mb-1">{t(`privacy.${id}.legal`)}</p>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{t(`privacy.${id}.legalText`)}</p>
    </section>
  );
}

export default function PrivacyContent() {
  const t = useTranslations();
  const s3Data = t.raw('privacy.s3Data') as string[];
  const s6Rights = t.raw('privacy.s6Rights') as string[];

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('privacy.title')} subtitle={t('privacy.subtitle')} />
      </AnimateIn>

      <AnimateIn from="bottom" delay={100}>
      <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/10 space-y-10">

        {/* Verantwortlicher */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s1Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s1Text')}</p>
          <div className="text-gray-600 dark:text-gray-400 text-sm font-mono space-y-1">
            <p className="font-bold text-black dark:text-white">{LEGAL_CONTACT.name}</p>
            <p>{LEGAL_CONTACT.careOf}</p>
            <p>{LEGAL_CONTACT.street}</p>
            <p>{LEGAL_CONTACT.city}</p>
            <p className="mt-3">
              {t('privacy.email')}{' '}
              <a href={`mailto:${LEGAL_CONTACT.email}`} className="underline hover:text-black dark:hover:text-white">
                {LEGAL_CONTACT.email}
              </a>
            </p>
          </div>
        </section>

        {/* Allgemeine Hinweise */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s2Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{t('privacy.s2Text')}</p>
        </section>

        <ProcessingSection id="hosting" />

        {/* Kontaktformular */}
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

        <ProcessingSection id="captcha" />

        {/* Speicherung (Supabase) */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s4Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s4Text')}</p>

          <p className="text-sm font-bold text-black dark:text-white mb-1">{t('privacy.s4Provider')}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s4ProviderText')}</p>

          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s4Detail')}</p>
        </section>

        <ProcessingSection id="mail" />
        <ProcessingSection id="analytics" />
        <ProcessingSection id="storage" />

        {/* Speicherdauer */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s5Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s5Text')}</p>
        </section>

        {/* Ihre Rechte */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s6Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{t('privacy.s6Text')}</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1 mb-4">
            {s6Rights.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s6Contact')}</p>
        </section>

        {/* Widerspruchsrecht — Art. 21(4) GDPR wants it separate from other information */}
        <section className="border-l-2 border-black dark:border-white pl-4">
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.objection.title')}</h2>
          <p className="text-black dark:text-white text-sm font-medium">{t('privacy.objection.text')}</p>
        </section>

        {/* Beschwerderecht */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s7Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t('privacy.s7Text')}</p>
          <div className="text-gray-600 dark:text-gray-400 text-sm font-mono space-y-1">
            <p className="font-bold text-black dark:text-white">{SUPERVISORY_AUTHORITY.name}</p>
            <p>{SUPERVISORY_AUTHORITY.street}</p>
            <p>{SUPERVISORY_AUTHORITY.city}</p>
            <p>
              <a href={SUPERVISORY_AUTHORITY.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-black dark:hover:text-white">
                {SUPERVISORY_AUTHORITY.url.replace('https://', '')}
              </a>
            </p>
          </div>
        </section>

        {/* SSL */}
        <section>
          <h2 className="text-lg font-mono font-bold text-black dark:text-white mb-4">{t('privacy.s8Title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('privacy.s8Text')}</p>
        </section>

        <p className="text-xs font-mono text-gray-500">{t('privacy.asOf')}</p>

      </div>
      </AnimateIn>
    </div>
  );
}
