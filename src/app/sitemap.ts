import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://velimir-mueller.vercel.app';

const paths = [
  '',
  '/services',
  '/projects',
  '/about',
  '/contact',
  '/imprint',
  '/privacy',
  '/services/requirements-engineering',
  '/services/ux-ui-branding',
  '/services/frontend-development',
  '/services/project-delivery',
  '/services/modern-stack',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of paths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : path === '/contact' ? 0.9 : 0.8,
      });
    }
  }

  return entries;
}
