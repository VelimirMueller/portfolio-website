import { getTranslations } from 'next-intl/server';
import { Navigation } from '@/components/organisms/Navigation';
import { Footer } from '@/components/organisms/Footer';
import { siteJsonLd } from '@/app/seo';
import { PageWarp, SiteHyperspace } from '@/components/effects/SiteHyperspace';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MainLayout({ children, params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'a11y' });

  const jsonLd = JSON.stringify(siteJsonLd(locale));

  return (
    <div className="flex flex-col min-h-screen text-light-text dark:text-dark-text font-sans transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">
        {t('skipToContent')}
      </a>
      <SiteHyperspace />
      <Navigation />
      <main id="main-content" className="grow">
        <PageWarp>{children}</PageWarp>
      </main>
      <Footer />
    </div>
  );
}
