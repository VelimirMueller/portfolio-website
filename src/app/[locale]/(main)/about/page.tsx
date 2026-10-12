import { pageMetadata } from '@/app/seo';
import { getPositioning } from '@/config/positioning';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import AboutContent from './AboutContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return pageMetadata({
    locale,
    path: '/about',
    title: t('metaTitle'),
    description: t('metaDesc', { jobTitle: getPositioning(locale).jobTitle }),
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}
