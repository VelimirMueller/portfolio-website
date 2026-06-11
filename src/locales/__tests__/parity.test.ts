import de from '../de.json';
import en from '../en.json';

/** Collects every dot-separated leaf path of a nested message catalog. */
function leafPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe('locale catalog parity', () => {
  it('de and en define exactly the same message keys', () => {
    const deKeys = leafPaths(de).sort();
    const enKeys = leafPaths(en).sort();

    const missingInEn = deKeys.filter((k) => !enKeys.includes(k));
    const missingInDe = enKeys.filter((k) => !deKeys.includes(k));

    expect({ missingInEn, missingInDe }).toEqual({
      missingInEn: [],
      missingInDe: [],
    });
  });
});
