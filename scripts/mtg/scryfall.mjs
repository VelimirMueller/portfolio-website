// Shared Scryfall helpers for the admin "Magic" section scripts.
// Plain Node (no deps), so the scripts run with `node scripts/mtg/<file>.mjs`.

export const USER_AGENT = 'velimir-portfolio/1.0 (admin magic catalog)';

/** Layouts that are not playable cards: tokens, art cards, planes, jokes. */
export const SKIP_LAYOUTS = new Set([
  'art_series',
  'token',
  'double_faced_token',
  'emblem',
  'vanguard',
  'planar',
  'scheme',
  'front_card',
]);

/** A real card you can hold: printed on paper and not a token/art/plane layout. */
export function isPaperCard(card) {
  return !SKIP_LAYOUTS.has(card.layout) && (card.games ?? []).includes('paper');
}

const face = (card) => card.card_faces?.[0] ?? {};

/**
 * One Scryfall card -> one catalog row (columns of public.mtg_catalog).
 * Double-faced and prepare cards ("Front // Spell") take cost, colors, P/T
 * and image from the front face; the text keeps every face.
 */
export function toCatalogRow(card) {
  const front = face(card);
  const text = card.oracle_text ?? (card.card_faces ?? []).map((f) => `${f.name}: ${f.oracle_text ?? ''}`).join('\n\n');
  const power = card.power ?? front.power;
  const toughness = card.toughness ?? front.toughness;
  const cost = card.mana_cost?.split(' // ')[0] || front.mana_cost || null;
  return {
    // Reversible cards carry oracle_id only on their faces, not at the top.
    oracle_id: card.oracle_id ?? front.oracle_id,
    name: card.name,
    mana_cost: cost || null,
    mana_value: card.cmc ?? 0,
    type_line: card.type_line ?? front.type_line ?? '',
    oracle_text: text ?? '',
    colors: card.colors ?? front.colors ?? [],
    power_toughness: power != null && toughness != null ? `${power}/${toughness}` : null,
    loyalty: card.loyalty ?? front.loyalty ?? null,
    rarity: card.rarity ?? null,
    set_code: card.set ?? null,
    set_name: card.set_name ?? null,
    released_at: card.released_at ?? null,
    image_url: card.image_uris?.normal ?? front.image_uris?.normal ?? null,
    scryfall_uri: card.scryfall_uri ?? null,
  };
}

export const CATALOG_COLUMNS = [
  'oracle_id', 'name', 'mana_cost', 'mana_value', 'type_line', 'oracle_text', 'colors',
  'power_toughness', 'loyalty', 'rarity', 'set_code', 'set_name', 'released_at', 'image_url', 'scryfall_uri',
];

/** Postgres CSV field: null stays empty (unquoted), arrays become {a,b}. */
export function csvField(value) {
  if (value === null || value === undefined) return '';
  const s = Array.isArray(value) ? `{${value.join(',')}}` : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Resolves the newest Oracle Cards bulk file URL. */
export async function oracleBulkUrl() {
  const res = await fetch('https://api.scryfall.com/bulk-data', {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Scryfall bulk-data: HTTP ${res.status}`);
  const { data } = await res.json();
  const oracle = data.find((b) => b.type === 'oracle_cards');
  const url = oracle?.download_uri ?? oracle?.jsonl_download_uri;
  if (!url) throw new Error('Scryfall bulk-data: no oracle_cards file');
  return url;
}

/** Streams a Scryfall bulk file in JSONL form (one card per line, .gz or plain) and yields each card. */
export async function* readBulk(source) {
  const { createReadStream } = await import('node:fs');
  const { createGunzip } = await import('node:zlib');
  const { Readable } = await import('node:stream');
  const readline = await import('node:readline');

  let stream;
  if (/^https?:/.test(source)) {
    const res = await fetch(source, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    stream = Readable.fromWeb(res.body);
  } else {
    stream = createReadStream(source);
  }
  if (source.endsWith('.gz')) stream = stream.pipe(createGunzip());

  for await (const raw of readline.createInterface({ input: stream, crlfDelay: Infinity })) {
    const line = raw.trim();
    if (line) yield JSON.parse(line);
  }
}
