import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import ProjectsContent from './ProjectsContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });

  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProjectsContent />;
}
