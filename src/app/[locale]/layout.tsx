import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { pickClientMessages } from '@/i18n/clientMessages';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { rootMetadata } from '@/app/seo';
import { inter, spaceMono, themeInitScript } from '../shared-layout';
import '../globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
};

export async function generateMetadata({
  params,
}: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return rootMetadata(locale);
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'de' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  // Full catalog stays on the server (content components are RSCs reading it
  // via useTranslations); the client provider receives only the namespaces
  // client components actually consume.
  const messages = (await import(`@/locales/${locale}.json`)).default;
  const clientMessages = pickClientMessages(messages);

  return (
    <html
      lang={locale}
      className={`dark ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.className} bg-light-bg dark:bg-dark-bg`}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={clientMessages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
