import { Inter, Space_Mono } from 'next/font/google';

/**
 * Shared between the two root layouts ([locale] for the site, projects for
 * the standalone demos) so fonts and theme bootstrapping stay identical.
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
  preload: false,
});

/**
 * Static, build-time string — applies the persisted or system theme before
 * first paint to avoid a flash. Never receives user input.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`;
