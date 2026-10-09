import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@6.9.1'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// Sender and recipient in one place. The domain is verified in Resend;
// onboarding@resend.dev (Resend's test sender) must never come back.
const FROM = Deno.env.get('EMAIL_FROM') ?? 'Veli <noreply@velimir-mueller.de>'
const TO = Deno.env.get('CONTACT_TO') ?? 'velimir.mueller@googlemail.com'
const SITE = 'https://www.velimir-mueller.de'

// Only the database trigger may call this function. It sends this shared secret
// (from Vault) in x-contact-hook-secret; see migration 20261009170000_contact_email_hook.sql.
const HOOK_SECRET = Deno.env.get('CONTACT_HOOK_SECRET') ?? ''

/**
 * Constant-time compare: both sides are hashed first, so the loop always walks
 * 32 bytes, whatever the length of the input (no length or prefix leaks).
 */
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const hash = async (v: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)))
  const [a, b] = await Promise.all([hash(given), hash(expected)])
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status })

// Mirrored verbatim from src/utils/escapeHtml.ts (tested there via Jest) —
// Deno functions cannot import from src/. Keep both copies in sync.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const MONO = "'Space Mono',ui-monospace,Menlo,Consolas,monospace"
const SANS = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

/** One labelled field (name, email) in the card. Values must already be escaped. */
function field(label: string, valueHtml: string): string {
  return `
    <tr><td class="pad" style="padding:0 48px 18px 48px;">
      <p style="margin:0 0 6px 0;font-family:${MONO};font-size:12px;color:#818CF8;letter-spacing:1px;">// ${label}</p>
      <p style="margin:0;font-family:${SANS};font-size:16px;line-height:1.5;color:#F4F4F5;">${valueHtml}</p>
    </td></tr>`
}

/**
 * The notification in the site's design language (same as the sign-in email in
 * supabase/templates/magic-link.html): dark card, hyperspace header, VM monogram,
 * `// labels` in Space Mono. All inputs are escaped by the caller.
 */
export function renderContactEmail(p: { name: string; email: string; message: string; firstName: string; received: string }): string {
  const replyHref = `mailto:${p.email}?subject=${encodeURIComponent('Re: Your message on velimir-mueller.de')}`
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>New message from ${p.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: dark; }
  body { margin:0; padding:0; background:#09090B; }
  @media (max-width: 620px) { .wrap { width:100% !important; } .pad { padding-left:24px !important; padding-right:24px !important; } }
</style>
</head>
<body style="margin:0;padding:0;background:#09090B;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#09090B;">${p.name} wrote you via the contact form.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#09090B" style="background:#09090B;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

  <tr><td style="padding:0 4px 20px 4px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="32" height="32" align="center" valign="middle" bgcolor="#F4F4F5" style="width:32px;height:32px;border-radius:16px;background:#F4F4F5;color:#09090B;font-family:${MONO};font-size:11px;font-weight:700;">VM</td>
      <td style="padding-left:12px;font-family:${MONO};font-size:13px;font-weight:700;color:#F4F4F5;letter-spacing:-0.2px;">Velimir Müller</td>
    </tr></table>
  </td></tr>

  <tr><td bgcolor="#121214" style="background:#121214;border:1px solid #27272A;border-radius:20px;overflow:hidden;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="line-height:0;font-size:0;">
        <img src="${SITE}/email/hyperspace-header.png" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:20px 20px 0 0;">
      </td></tr>

      <tr><td class="pad" style="padding:8px 48px 24px 48px;">
        <p style="margin:0 0 10px 0;font-family:${MONO};font-size:12px;color:#818CF8;letter-spacing:1px;">// contact form</p>
        <h1 style="margin:0;font-family:${SANS};font-size:26px;line-height:1.25;font-weight:700;color:#F4F4F5;">New message from ${p.firstName}</h1>
      </td></tr>

      ${field('name', p.name)}
      ${field('email', `<a href="mailto:${p.email}" style="color:#A5B4FC;text-decoration:none;">${p.email}</a>`)}

      <tr><td class="pad" style="padding:6px 48px 0 48px;">
        <p style="margin:0 0 8px 0;font-family:${MONO};font-size:12px;color:#818CF8;letter-spacing:1px;">// message</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td bgcolor="#09090B" style="background:#09090B;border:1px solid #27272A;border-left:3px solid #6366F1;border-radius:12px;padding:18px 20px;">
            <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.7;color:#E4E4E7;white-space:pre-wrap;">${p.message}</p>
          </td>
        </tr></table>
      </td></tr>

      <tr><td class="pad" style="padding:28px 48px 0 48px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td bgcolor="#4F46E5" style="border-radius:999px;background:#4F46E5;background-image:linear-gradient(90deg,#6366F1,#8B5CF6);">
            <a href="${replyHref}" style="display:inline-block;padding:13px 28px;font-family:${MONO};font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:999px;">Reply to ${p.firstName} &rarr;</a>
          </td>
        </tr></table>
        <p style="margin:14px 0 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:#71717A;">Or just hit reply: it goes to ${p.email}.</p>
      </td></tr>

      <tr><td class="pad" style="padding:28px 48px 36px 48px;">
        <div style="height:1px;line-height:1px;font-size:0;background:#27272A;">&nbsp;</div>
        <p style="margin:16px 0 0 0;font-family:${MONO};font-size:12px;color:#71717A;">Received ${p.received} · <a href="${SITE}/admin" style="color:#A5B4FC;text-decoration:none;">open the inbox</a></p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:24px 4px 0 4px;font-family:${MONO};font-size:11px;color:#52525B;letter-spacing:0.5px;">
    <a href="${SITE}" style="color:#52525B;text-decoration:none;">velimir-mueller.de</a>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

serve(async (req) => {
  // Fail closed: no secret configured means nobody gets through.
  if (!HOOK_SECRET) {
    console.error('send-contact-email: CONTACT_HOOK_SECRET is not set')
    return json({ error: 'Not configured' }, 500)
  }
  if (req.method !== 'POST' || !(await sameSecret(req.headers.get('x-contact-hook-secret') ?? '', HOOK_SECRET))) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { record } = await req.json()

    // User-controlled values must never reach the HTML template unescaped
    const rawEmail = String(record.email ?? '').trim()
    const name = escapeHtml(String(record.name ?? ''))
    const email = escapeHtml(rawEmail)
    const message = escapeHtml(String(record.message ?? ''))
    const firstName = escapeHtml(String(record.name ?? '').trim().split(/\s+/)[0] || 'them')
    const received = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' })

    const data = await resend.emails.send({
      from: FROM,
      to: TO,
      // Hitting "reply" in the mail app answers the visitor directly.
      ...(EMAIL.test(rawEmail) ? { replyTo: rawEmail } : {}),
      // Plain text, but still one line: a newline in a header could smuggle in another header.
      subject: `New message from ${String(record.name ?? 'someone').replace(/[\r\n]+/g, ' ').slice(0, 80)}`,
      html: renderContactEmail({ name, email, message, firstName, received }),
    })

    return json(data, 200)
  } catch (error) {
    console.error('send-contact-email failed:', error)
    return json({ error: 'Failed to send email' }, 500)
  }
})
