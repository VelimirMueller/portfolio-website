// Builds the CSVs for public.mtg_printing and public.mtg_card_name from Scryfall's
// All Cards bulk file (every printing in every language, ~545k rows).
//
//   node scripts/mtg/build-printings.mjs <printings.csv> <names.csv> [local-all-cards.jsonl.gz]
//   psql "$SUPABASE_DB_URL" -v printings=<printings.csv> -v names=<names.csv> -f scripts/mtg/load-printings.sql
//
// Without a local file the newest bulk file is streamed (~400 MB gzipped); nothing
// is held in memory beyond the current line.
import { createWriteStream } from 'node:fs';
import { USER_AGENT, csvField, isPaperCard, readBulk } from './scryfall.mjs';

/** Languages Velimir owns cards in: printings (set + number) for all three, printed names for German and French. */
const LANGS = new Set(['en', 'de', 'fr']);
/** Printed names are kept for these languages (English names come from the catalog). */
const NAME_LANGS = new Set(['de', 'fr']);

const [printingsOut, namesOut, local] = process.argv.slice(2);
if (!printingsOut || !namesOut) {
  console.error('usage: node scripts/mtg/build-printings.mjs <printings.csv> <names.csv> [all-cards.jsonl.gz]');
  process.exit(1);
}

async function allCardsUrl() {
  const res = await fetch('https://api.scryfall.com/bulk-data', {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Scryfall bulk-data: HTTP ${res.status}`);
  const { data } = await res.json();
  const all = data.find((b) => b.type === 'all_cards');
  const url = all?.download_uri ?? all?.jsonl_download_uri;
  if (!url) throw new Error('Scryfall bulk-data: no all_cards file');
  return url;
}

const source = local ?? (await allCardsUrl());
const printings = createWriteStream(printingsOut);
const names = createWriteStream(namesOut);
for (const [stream, file] of [[printings, printingsOut], [names, namesOut]]) {
  stream.on('error', (err) => {
    console.error(`cannot write ${file}: ${err.message}`);
    process.exit(1);
  });
}
const seenPrinting = new Set();
const seenName = new Set();
let scanned = 0;

for await (const card of readBulk(source)) {
  scanned++;
  if (!LANGS.has(card.lang) || !isPaperCard(card)) continue;
  const oracleId = card.oracle_id ?? card.card_faces?.[0]?.oracle_id;
  if (!oracleId) continue;

  const key = `${card.set}|${card.collector_number}|${card.lang}`;
  if (!seenPrinting.has(key)) {
    seenPrinting.add(key);
    printings.write([oracleId, card.set, card.collector_number, card.lang].map(csvField).join(',') + '\n');
  }

  if (NAME_LANGS.has(card.lang)) {
    const printed = [card.printed_name, ...(card.card_faces ?? []).map((f) => f.printed_name)].filter(Boolean);
    for (const name of printed) {
      const nameKey = `${card.lang}|${name}|${oracleId}`;
      if (seenName.has(nameKey)) continue;
      seenName.add(nameKey);
      names.write([card.lang, name, oracleId].map(csvField).join(',') + '\n');
    }
  }
}

await Promise.all([printings, names].map((s) => new Promise((resolve) => s.end(resolve))));
console.log(`printings: ${seenPrinting.size}, names: ${seenName.size} (from ${scanned} cards in ${source})`);
