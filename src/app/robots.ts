import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://velimir-mueller.vercel.app';

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
