import { pageMetadata } from '@/app/seo';
import { getPositioning, siteTitle } from '@/config/positioning';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import HomeContent from './HomeContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return pageMetadata({
    locale,
    path: '',
    title: siteTitle(locale),
    description: t('metaDesc', { jobTitle: getPositioning(locale).jobTitle }),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}
