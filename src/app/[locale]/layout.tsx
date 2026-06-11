import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { pickClientMessages } from '@/i18n/clientMessages';
import { VercelInsights } from '@/components/VercelInsights';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SITE_URL } from '@/config/site';
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Velimir Müller | Senior Product Engineer & AI Agentic Developer',
  description:
    'Senior Product Engineer & AI Agentic Developer — end-to-end product ownership, MCP server development, and full-stack engineering with Next.js, React, and Claude Code.',
  keywords: [
    'Senior Product Engineer',
    'AI Agentic Developer',
    'MCP Server Developer',
    'Model Context Protocol',
    'Claude Code',
    'Product Owner',
    'Full-stack Developer',
    'Next.js Developer',
    'Agentic AI',
    'React',
    'TypeScript',
  ],
  openGraph: {
    type: 'website',
    title: 'Velimir Müller | Senior Product Engineer & AI Agentic Developer',
    description:
      'Senior Product Engineer & AI Agentic Developer — end-to-end product ownership, MCP server development, and full-stack engineering with Next.js, React, and Claude Code.',
    siteName: 'Velimir Müller',
    locale: 'en',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velimir Müller | Senior Product Engineer & AI Agentic Developer',
    description:
      'Senior Product Engineer & AI Agentic Developer — end-to-end product ownership, MCP server development, and full-stack engineering with Next.js, React, and Claude Code.',
  },
};

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
        <VercelInsights />
      </body>
    </html>
  );
}
