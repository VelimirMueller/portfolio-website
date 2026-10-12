import type { Metadata, Viewport } from 'next';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SITE_URL } from '@/config/site';
import { SITE_NAME, getPositioning, siteTitle } from '@/config/positioning';
import { inter, spaceMono, themeInitScript } from '../shared-layout';
import '../globals.css';

/**
 * Root layout for the standalone interactive demos, which intentionally live
 * outside the [locale] tree (they are not localized). The demos are
 * English-only, hence the static lang.
 */

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
  title: siteTitle('en'),
  description: `Interactive project demos — ${SITE_NAME}, ${getPositioning('en').jobTitle}.`,
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.className} bg-light-bg dark:bg-dark-bg`}>
        <ThemeProvider>{children}</ThemeProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
