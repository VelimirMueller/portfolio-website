import React from 'react';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LEGAL_CONTACT } from '@/config/legal';

function ImprintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-mono font-bold text-black dark:text-white mb-4">{title}</h2>
      <div className="text-gray-600 dark:text-gray-400 space-y-1 font-mono text-sm">{children}</div>
    </section>
  );
}

export default function ImprintContent() {
  const t = useTranslations();

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <AnimateIn from="bottom">
        <SectionHeader title={t('imprint.title')} subtitle={t('imprint.subtitle')} />
      </AnimateIn>

      <AnimateIn from="bottom" delay={100}>
      <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl border border-black/5 dark:border-white/10 space-y-10">
        <ImprintSection title={t('imprint.address')}>
          <p className="font-bold text-black dark:text-white">{LEGAL_CONTACT.name}</p>
          <p>{LEGAL_CONTACT.careOf}</p>
          <p>{LEGAL_CONTACT.street}</p>
          <p>{LEGAL_CONTACT.city}</p>
          <p>{LEGAL_CONTACT.country}</p>
        </ImprintSection>

        <ImprintSection title={t('imprint.contactTitle')}>
          <p>
            {t('imprint.email')}{' '}
            <a href={`mailto:${LEGAL_CONTACT.email}`} className="underline hover:text-black dark:hover:text-white">
              {LEGAL_CONTACT.email}
            </a>
          </p>
          <p>
            {t('imprint.form')}{' '}
            <Link href="/contact" className="underline hover:text-black dark:hover:text-white">
              {t('imprint.formLink')}
            </Link>
          </p>
        </ImprintSection>

        <ImprintSection title={t('imprint.disputeTitle')}>
          <p className="font-sans">{t('imprint.disputeText')}</p>
        </ImprintSection>
      </div>
      </AnimateIn>
    </div>
  );
}
