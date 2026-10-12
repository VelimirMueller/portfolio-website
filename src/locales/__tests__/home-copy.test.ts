/**
 * The home hero, the "At a glance" cards and the home meta description show
 * only facts a visitor can check: no employer names, no press names and no
 * simulated benchmark numbers (#123).
 */
import de from '../de.json';
import en from '../en.json';

const FORBIDDEN_HOME_TERMS = [
  'GALVANY',
  'DEMOS',
  'bewerbermappe',
  'BILD',
  'Zeit',
  'n-tv',
  '3–4×',
  '~40%',
  '81 tools',
  '81 Tools',
] as const;

type HomeCatalog = typeof en.home;

/** Every string of the hero, the four cards and the meta description. */
function heroCardAndMetaStrings(home: HomeCatalog): Record<string, string> {
  const strings: Record<string, string> = {
    metaDesc: home.metaDesc,
    badge: home.badge,
    eyebrow: home.eyebrow,
    tagline: home.tagline,
    sub: home.sub,
    description: home.description,
    statsLabel: home.statsLabel,
  };
  home.stats.forEach((stat, i) => {
    strings[`stats.${i}.value`] = stat.value;
    strings[`stats.${i}.label`] = stat.label;
  });
  return strings;
}

describe.each([
  ['en', en.home],
  ['de', de.home],
] as const)('home hero, cards and meta description (%s)', (_locale, home) => {
  it('has exactly four cards', () => {
    expect(home.stats).toHaveLength(4);
  });

  it.each(FORBIDDEN_HOME_TERMS)('does not contain "%s"', (term) => {
    const hits = Object.entries(heroCardAndMetaStrings(home))
      .filter(([, value]) => value.includes(term))
      .map(([key]) => key);
    expect(hits).toEqual([]);
  });
});
