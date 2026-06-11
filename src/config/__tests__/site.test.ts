describe('site config', () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_ENV;
    jest.resetModules();
  });

  const load = () => {
    let mod: typeof import('../site');
    jest.isolateModules(() => {
      mod = require('../site');
    });
    return mod!;
  };

  it('falls back to the live production domain', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(load().SITE_URL).toBe('https://www.velimir-mueller.de');
  });

  it('uses NEXT_PUBLIC_SITE_URL when set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example.com';
    expect(load().SITE_URL).toBe('https://preview.example.com');
  });

  it('strips a trailing slash so consumers can append paths', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example.com/';
    expect(load().SITE_URL).toBe('https://preview.example.com');
  });

  it('builds locale-prefixed absolute URLs', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const { localeUrl } = load();
    expect(localeUrl('de')).toBe('https://www.velimir-mueller.de/de');
    expect(localeUrl('en', '/services')).toBe(
      'https://www.velimir-mueller.de/en/services'
    );
  });
});
