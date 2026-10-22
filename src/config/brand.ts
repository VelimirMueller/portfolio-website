/**
 * VM. brand group of this site (vm-brand B-34: portfolio-website is Flagship).
 * The root layouts put it on <html data-group>, so @synthwerk/tokens resolves the
 * flagship accent (src/app/globals.css).
 */
export const BRAND_GROUP = 'flagship';

/**
 * The page colours, for places that cannot read CSS: theme-color, the web app
 * manifest, the emails. Dark is the one dark page of every VM. surface (vm-brand
 * B-54); light is zinc-50 from @synthwerk/tokens. Same values as --color-dark-bg
 * and --color-light-bg in src/app/globals.css.
 */
export const PAGE_COLOR = { dark: '#0a0a0b', light: '#fafafa' } as const;
