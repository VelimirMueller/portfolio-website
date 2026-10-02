/**
 * Turns a click into a short, stable label for the KPI page — or null when
 * the click is not worth counting.
 *
 * Rules, in order:
 * 1. An element (or ancestor) with data-track="…" wins. Use it for anything
 *    the dashboard should name explicitly: CTAs, cards, toggles.
 * 2. Links are labelled by where they go: "link:/de/contact", "link:github.com".
 * 3. Buttons are labelled by their accessible name: "button:Send".
 * 4. Everything else — text, images, form fields — is ignored. Typed input is
 *    never read; only a button's own label is.
 */
const MAX_LABEL = 80;

function clean(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL);
}

function linkLabel(anchor: HTMLAnchorElement): string | null {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) return null;
  if (href.startsWith('mailto:')) return 'link:mailto';
  if (href.startsWith('tel:')) return 'link:tel';
  try {
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) return `link:${url.pathname}`;
    return `link:${url.hostname.replace(/^www\./, '')}`;
  } catch {
    return null;
  }
}

export function describeClickTarget(start: EventTarget | null): string | null {
  if (!(start instanceof Element)) return null;

  const tracked = start.closest<HTMLElement>('[data-track]');
  if (tracked) return clean(tracked.dataset.track) || null;

  const anchor = start.closest('a');
  if (anchor) return linkLabel(anchor);

  const button = start.closest<HTMLElement>('button, [role="button"]');
  if (button) {
    const name = clean(button.getAttribute('aria-label') || button.textContent);
    return name ? `button:${name}` : null;
  }

  return null;
}
