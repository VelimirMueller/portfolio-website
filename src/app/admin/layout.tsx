import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SITE_URL } from '@/config/site';
import { inter, spaceMono, themeInitScript } from '../shared-layout';
import '../globals.css';

/**
 * Root layout for the private admin area. English-only and outside [locale],
 * like the demos. noindex here plus Disallow in robots.ts — the real
 * protection is the session check and RLS.
 */

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Admin | Velimir Müller',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text`}
      >
        <ThemeProvider>
          <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
