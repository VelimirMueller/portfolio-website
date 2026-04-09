import { Navigation } from '@/components/organisms/Navigation';
import { Footer } from '@/components/organisms/Footer';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MainLayout({ children, params }: Props) {
  const { locale } = await params;

  const jsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Velimir Müller',
      jobTitle: 'Senior Product Engineer',
      description:
        'Senior Product Engineer & AI Agentic Developer specializing in end-to-end product ownership, MCP server development, and full-stack engineering with Next.js and Claude Code.',
      url: 'https://velimir-mueller.vercel.app',
      sameAs: [
        'https://www.linkedin.com/in/velimir-müller-07b460175',
        'https://github.com/VelimirMueller',
      ],
      knowsAbout: [
        'React',
        'TypeScript',
        'Next.js',
        'Laravel',
        'Supabase',
        'AWS',
        'ML',
        'Agentic AI',
        'Model Context Protocol',
        'MCP Server Development',
        'Claude Code',
        'Product Management',
        'AI-Powered Development Tools',
        'Vercel',
        'Full-Stack Development',
      ],
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Senior Product Engineer',
        occupationLocation: { '@type': 'Country', name: 'Germany' },
        skills:
          'Full-Stack Development, Next.js, React, TypeScript, AI Agentic Development, MCP Server Development, Product Ownership, Claude Code',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Velimir Müller',
      url: 'https://velimir-mueller.vercel.app',
      description:
        'Portfolio of Velimir Müller — Senior Product Engineer, AI Agentic Developer, and MCP server developer.',
      inLanguage: ['de', 'en'],
    },
  ]);

  return (
    <div className="flex flex-col min-h-screen text-light-text dark:text-dark-text font-sans transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
