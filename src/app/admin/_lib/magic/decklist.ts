// Parses a pasted decklist into lines for the SQL function mtg_import_deck.
// Pure; the names are resolved against the catalog in the database.
//
// Understands the common export formats:
//   Moxfield plain text  "4 Goblin Guide", then "SIDEBOARD:" and the sideboard
//   Moxfield with sets   "4 Goblin Guide (ZEN) 126 *F*"
//   MTG Arena            "Deck" / "Sideboard" headers, "4x Goblin Guide"
// Commander and companion lines count as main deck; a maybeboard is skipped.

export type ImportSection = 'main' | 'sideboard';
export type ImportLine = { section: ImportSection; qty: number; name: string };
export type ParsedDecklist = { lines: ImportLine[]; errors: string[] };

export const MAX_IMPORT_LINES = 250;

const HEADERS: Record<string, ImportSection | 'skip'> = {
  deck: 'main',
  main: 'main',
  mainboard: 'main',
  commander: 'main',
  companion: 'main',
  sideboard: 'sideboard',
  maybeboard: 'skip',
  considering: 'skip',
  tokens: 'skip',
};

// "4 Name", "4x Name"; then optional "(SET) 123", "*F*" / "*E*" foil marks, "#tags".
const LINE = /^(\d{1,2})x?\s+(.+?)(?:\s+\([A-Za-z0-9]{2,6}\)(?:\s+\S+)?)?(?:\s+\*[A-Z]\*)*(?:\s+#.*)?$/;

/** "Fire / Ice" (some exports) and "Fire // Ice" are the same card. */
function cleanName(name: string): string {
  return name.replace(/\s+\/{1,2}\s+/g, ' // ').trim();
}

export function parseDecklist(text: string): ParsedDecklist {
  const lines: ImportLine[] = [];
  const errors: string[] = [];
  let section: ImportSection | 'skip' = 'main';

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('//')) return;

    const header = HEADERS[line.replace(/[:\s]+$/, '').toLowerCase()];
    if (header) {
      section = header;
      return;
    }
    if (section === 'skip') return;

    const m = LINE.exec(line);
    const qty = m ? Number(m[1]) : 0;
    if (!m || qty < 1) {
      errors.push(`Line ${i + 1}: "${line.slice(0, 80)}" is not "<count> <card name>".`);
      return;
    }
    lines.push({ section, qty, name: cleanName(m[2]) });
  });

  if (lines.length > MAX_IMPORT_LINES) errors.push(`At most ${MAX_IMPORT_LINES} lines per deck.`);
  if (!errors.length && !lines.some((l) => l.section === 'main')) errors.push('The main deck is empty.');
  return { lines, errors };
}

/** URL slug for a deck name: "Krenko, Mob Boss!" -> "krenko-mob-boss". Empty when nothing usable is left. */
export function deckSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}
