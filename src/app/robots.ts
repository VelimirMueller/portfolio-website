import { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

const baseUrl = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/projects/dashboard-demo', '/projects/project-planner'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
