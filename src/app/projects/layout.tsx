import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SITE_URL } from '@/config/site';
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
  title: 'Velimir Müller | Senior Product Engineer & AI Agentic Developer',
  description:
    'Interactive project demos — Velimir Müller, Senior Product Engineer & AI Agentic Developer.',
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
      </body>
    </html>
  );
}
