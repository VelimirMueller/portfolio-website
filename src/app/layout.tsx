import type { Metadata, Viewport } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
  preload: false,
});

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://velimir-mueller.vercel.app'
  ),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`dark ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-light-bg dark:bg-dark-bg`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
