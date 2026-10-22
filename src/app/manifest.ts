import type { MetadataRoute } from 'next';
import { PAGE_COLOR } from '@/config/brand';
import { SITE_NAME } from '@/config/positioning';

/**
 * Web app manifest, served at /manifest.webmanifest.
 *
 * The icons are the VM. favicon set from vm-brand (mark v2 B-50, favicon B-51), built by
 * vm-brand `scripts/make-favicon.py` at commit 4d5ef35 (PR #32). Do not edit the
 * PNGs here: rebuild them in vm-brand and copy them in. The same set feeds
 * src/app/favicon.ico, icon.svg and apple-icon.png. public/apple-touch-icon.png is a
 * byte copy of apple-icon.png: iOS and crawlers request that fixed path without
 * reading the <link> tag.
 *
 * Colours: the dark page (#0a0a0b, vm-brand B-54) behind the dark favicon tile,
 * the same value as the dark theme-color in [locale]/layout.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'VM.',
    start_url: '/',
    display: 'standalone',
    background_color: PAGE_COLOR.dark,
    theme_color: PAGE_COLOR.dark,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
