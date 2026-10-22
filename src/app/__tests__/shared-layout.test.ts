import { themeInitScript } from '../shared-layout';

// The no-flash script must set the Tailwind class and the @synthwerk/tokens
// data-mode to the same theme, with the same rules as ThemeProvider.
function run(saved: string | null, prefersLight: boolean) {
  const root = document.documentElement;
  root.className = 'dark';
  root.removeAttribute('data-mode');
  jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(saved);
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: prefersLight && query === '(prefers-color-scheme:light)',
    media: query,
  }));
  new Function(themeInitScript)();
  return { classes: [...root.classList].sort(), mode: root.getAttribute('data-mode') };
}

describe('themeInitScript', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['light', false, 'light'],
    ['dark', true, 'dark'],
    [null, true, 'light'],
    [null, false, 'dark'],
    ['purple', false, 'dark'],
  ])('saved %p, system light %p → %s', (saved, prefersLight, theme) => {
    expect(run(saved, prefersLight)).toEqual({ classes: [theme], mode: theme });
  });
});
