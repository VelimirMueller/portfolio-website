import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import ContactContent from './ContactContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}
