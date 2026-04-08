import { Navigation } from '@/components/organisms/Navigation';
import { Footer } from '@/components/organisms/Footer';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MainLayout({ children, params }: Props) {
  const { locale } = await params;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Velimir Müller',
    jobTitle: 'Senior Product Engineer',
    url: 'https://velimir-mueller.vercel.app',
    sameAs: [
      'https://www.linkedin.com/in/velimir-müller-07b460175',
      'https://github.com/VelimirMueller',
    ],
    knowsAbout: ['React', 'TypeScript', 'Next.js', 'Laravel', 'Supabase', 'AWS', 'ML'],
  });

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
