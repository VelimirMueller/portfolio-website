import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import PrivacyContent from './PrivacyContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}
