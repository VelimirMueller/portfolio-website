import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { ServiceDetailContent } from './ServiceDetailContent';
import { notFound } from 'next/navigation';

const validServiceIds = ['requirements-engineering', 'ux-ui-branding', 'frontend-development', 'project-delivery', 'modern-stack'];

export function generateStaticParams() {
  return validServiceIds.map((serviceId) => ({
    serviceId,
  }));
}

type Props = {
  params: Promise<{ locale: string; serviceId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, serviceId } = await params;

  if (!validServiceIds.includes(serviceId)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'serviceDetail' });

  return {
    title: `${t(`${serviceId}.title`)} — Velimir Müller`,
    description: t(`${serviceId}.description`),
    alternates: {
      canonical: `https://www.velimir-mueller.de/${locale}/services/${serviceId}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, serviceId } = await params;

  if (!validServiceIds.includes(serviceId)) {
    notFound();
  }

  setRequestLocale(locale);
  return <ServiceDetailContent serviceId={serviceId} />;
}
