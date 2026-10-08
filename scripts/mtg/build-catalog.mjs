// Builds the CSV for public.mtg_catalog from Scryfall's Oracle Cards bulk file.
//
//   node scripts/mtg/build-catalog.mjs <out.csv> [local-oracle-file.jsonl.gz]
//   psql "$SUPABASE_DB_URL" -v csv=<out.csv> -f scripts/mtg/load-catalog.sql
//
// Without a local file the newest bulk file is downloaded (~25 MB gzipped).
// Images are not downloaded: rows keep Scryfall's CDN URL.
import { createWriteStream } from 'node:fs';
import { CATALOG_COLUMNS, csvField, isPaperCard, oracleBulkUrl, readBulk, toCatalogRow } from './scryfall.mjs';

const [out, local] = process.argv.slice(2);
if (!out) {
  console.error('usage: node scripts/mtg/build-catalog.mjs <out.csv> [oracle-cards.jsonl.gz]');
  process.exit(1);
}

const source = local ?? (await oracleBulkUrl());
const file = createWriteStream(out);
const seen = new Set();
let rows = 0;
let skipped = 0;

for await (const card of readBulk(source)) {
  const row = toCatalogRow(card);
  // Paper cards only (no Alchemy/Arena-only). Oracle Cards has one row per
  // oracle_id; the seen-guard keeps the primary key safe anyway.
  if (!isPaperCard(card) || !row.oracle_id || seen.has(row.oracle_id)) {
    skipped++;
    continue;
  }
  seen.add(row.oracle_id);
  file.write(CATALOG_COLUMNS.map((c) => csvField(row[c])).join(',') + '\n');
  rows++;
}
file.end();
await new Promise((resolve) => file.on('finish', resolve));
console.log(`catalog: ${rows} cards written to ${out} (${skipped} tokens/art/digital-only skipped) from ${source}`);
