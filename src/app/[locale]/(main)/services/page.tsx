import { SITE_URL } from '@/config/site';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import ServicesContent from './ServicesContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });

  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: {
      canonical: `${SITE_URL}/${locale}/services`,
    },
  };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicesContent />;
}
