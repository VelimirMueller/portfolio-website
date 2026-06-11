/**
 * Escapes a string for safe interpolation into HTML element and attribute
 * contexts. Mirrored verbatim in supabase/functions/send-contact-email
 * (Deno cannot import from src/) — keep both copies in sync.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
