import { ServiceDetailContent } from './ServiceDetailContent';
import { notFound } from 'next/navigation';

const validServiceIds = ['requirements-engineering', 'ux-ui-branding', 'frontend-development', 'project-delivery', 'modern-stack'];

export function generateStaticParams() {
  return validServiceIds.map((serviceId) => ({
    serviceId,
  }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  if (!validServiceIds.includes(serviceId)) {
    notFound();
  }

  return <ServiceDetailContent serviceId={serviceId} />;
}
