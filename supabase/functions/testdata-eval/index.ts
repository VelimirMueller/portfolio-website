import { createClient } from '@supabase/supabase-js'

// The mtg-scanner testdata workflow (GitHub Actions) is the only caller. It sends
// this shared secret in x-testdata-key; the GitHub repo secret TESTDATA_KEY holds
// the same value. No Supabase JWT check (see supabase/config.toml).
//
//   POST {"action":"batch","batch_id":"<uuid>"} -> the batch and its cases, each with
//        a signed photo URL valid for 1 hour (the bucket stays private)
//   POST {"action":"match","readings":[...]}    -> mtg_match_scan for up to 50 readings
//
// Uses the service role, which counts as admin in is_admin() (migration 20261009220000).
const KEY = Deno.env.get('TESTDATA_EXPORT_KEY') ?? ''
const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
})

/**
 * Constant-time compare done by the runtime, as in send-contact-email: HMAC of the
 * expected secret under a random per-instance key, then crypto.subtle.verify().
 */
const VERIFY_KEY = crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
const encode = (v: string) => new TextEncoder().encode(v)
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const key = await VERIFY_KEY
  const mac = await crypto.subtle.sign('HMAC', key, encode(expected))
  return crypto.subtle.verify('HMAC', key, mac, encode(given))
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status })

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const MATCH_LIMIT = 50 // same as the SQL limit and the app's MATCH_BATCH
const URL_SECONDS = 3600

async function batch(batchId: unknown): Promise<Response> {
  if (typeof batchId !== 'string' || !UUID.test(batchId)) return json({ error: 'batch_id must be a UUID' }, 400)
  const { data: b, error: bErr } = await supabase
    .from('mtg_test_batch')
    .select('id, created_at, note, case_count')
    .eq('id', batchId)
    .maybeSingle()
  if (bErr) return json({ error: 'could not read the batch' }, 500)
  if (!b) return json({ error: 'no such batch' }, 404)

  const { data: cases, error: cErr } = await supabase
    .from('mtg_test_case')
    .select('id, created_at, app_version, photo_path, photo_ok, note, readings, predicted, expected')
    .eq('batch_id', batchId)
    .order('created_at')
  if (cErr) return json({ error: 'could not read the cases' }, 500)

  const out = []
  for (const c of cases ?? []) {
    const { data: signed } = await supabase.storage.from('mtg-testdata').createSignedUrl(c.photo_path, URL_SECONDS)
    // A missing photo is reported, not fatal: the OCR lines are enough to replay the rules.
    out.push({ ...c, photo_url: signed?.signedUrl ?? null })
  }
  return json({ batch: b, cases: out }, 200)
}

async function match(readings: unknown): Promise<Response> {
  if (!Array.isArray(readings) || readings.length === 0 || readings.length > MATCH_LIMIT) {
    return json({ error: `readings must be an array of 1 to ${MATCH_LIMIT}` }, 400)
  }
  const { data, error } = await supabase.rpc('mtg_match_scan', { p_readings: readings })
  if (error) return json({ error: 'match failed', code: error.code }, 500)
  return json(data, 200)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)
  if (!KEY || !(await sameSecret(req.headers.get('x-testdata-key') ?? '', KEY))) {
    return json({ error: 'unauthorized' }, 401)
  }
  let body: { action?: string; batch_id?: unknown; readings?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'body must be JSON' }, 400)
  }
  switch (body.action) {
    case 'batch':
      return batch(body.batch_id)
    case 'match':
      return match(body.readings)
    default:
      return json({ error: 'action must be batch or match' }, 400)
  }
})
