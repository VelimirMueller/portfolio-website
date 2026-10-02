import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  // No NEXT_LOCALE cookie: the locale is always in the URL (/de, /en), and the
  // privacy policy promises that a visit sets no cookies.
  localeCookie: false,
});
