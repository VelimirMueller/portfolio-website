import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import ImprintContent from './ImprintContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'imprint' });

  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function ImprintPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ImprintContent />;
}
