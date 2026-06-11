/**
 * Namespaces consumed by client components ('use client'): Navigation,
 * Footer, ContactContent, the error boundary, the localized 404, and the
 * skip link. Everything else renders on the server only and must NOT ship
 * in the client message payload — add a namespace here only when a client
 * component starts consuming it.
 *
 * Typed as a flow-through generic (not AbstractIntlMessages) because the
 * catalogs contain arrays consumed via t.raw(), which next-intl supports at
 * runtime but does not model in its message type.
 */
export const CLIENT_NAMESPACES = [
  'nav',
  'footer',
  'contact',
  'errorPage',
  'notFound',
  'a11y',
] as const;

export function pickClientMessages<T extends Record<string, unknown>>(
  messages: T
): Partial<T> {
  return Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in messages).map((ns) => [
      ns,
      messages[ns],
    ])
  ) as Partial<T>;
}
