import {
  browserOf,
  countryOf,
  deviceOf,
  isAdminSession,
  isBot,
  normalizePath,
  normalizeReferrer,
  optedOut,
  parseBeacon,
} from '../parse';

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const EDGE = `${CHROME_MAC} Edg/128.0.0.0`;
const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';

describe('normalizePath', () => {
  it('drops query, fragment and trailing slashes', () => {
    expect(normalizePath('/de/contact?email=a@b.c#form')).toBe('/de/contact');
    expect(normalizePath('/de/about/')).toBe('/de/about');
    expect(normalizePath('/')).toBe('/');
  });

  it('rejects absolute and protocol-relative URLs', () => {
    expect(normalizePath('https://evil.test/x')).toBeNull();
    expect(normalizePath('//evil.test/x')).toBeNull();
  });

  it('caps the length', () => {
    expect(normalizePath(`/${'a'.repeat(400)}`)).toHaveLength(300);
  });
});

describe('normalizeReferrer', () => {
  it('keeps only the host, without www', () => {
    expect(normalizeReferrer('https://www.Google.com/search?q=velimir', 'www.velimir-mueller.de')).toBe('google.com');
  });

  it('drops the own site', () => {
    expect(normalizeReferrer('https://velimir-mueller.de/de', 'www.velimir-mueller.de')).toBeNull();
  });

  it('keeps a utm_source value as a sanitised campaign name', () => {
    expect(normalizeReferrer('News Letter!', null)).toBe('newsletter');
    expect(normalizeReferrer('!!!', null)).toBeNull();
  });

  it('ignores empty input', () => {
    expect(normalizeReferrer(undefined, null)).toBeNull();
    expect(normalizeReferrer('   ', null)).toBeNull();
  });
});

describe('parseBeacon', () => {
  it('parses a landing page view', () => {
    expect(parseBeacon({ t: 'pageview', p: '/de?x=1', r: 'https://github.com/VelimirMueller' }, 'www.velimir-mueller.de')).toEqual({
      type: 'pageview',
      path: '/de',
      prevPath: null,
      referrer: 'github.com',
      target: null,
    });
  });

  it('parses an in-site navigation with the previous page', () => {
    expect(parseBeacon({ t: 'pageview', p: '/de/contact', v: '/de' }, null)).toMatchObject({ prevPath: '/de', referrer: null });
  });

  it('parses a click and ignores a referrer on it', () => {
    expect(parseBeacon({ t: 'click', p: '/de', e: '  hero:contact ', r: 'https://x.test' }, null)).toEqual({
      type: 'click',
      path: '/de',
      prevPath: null,
      referrer: null,
      target: 'hero:contact',
    });
  });

  it('rejects a click without a target, unknown types and bad paths', () => {
    expect(parseBeacon({ t: 'click', p: '/de' }, null)).toBeNull();
    expect(parseBeacon({ t: 'scroll', p: '/de' }, null)).toBeNull();
    expect(parseBeacon({ t: 'pageview', p: 'https://x.test' }, null)).toBeNull();
    expect(parseBeacon(null, null)).toBeNull();
  });
});

describe('user agent classification', () => {
  it('detects bots and empty agents', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBot('Mozilla/5.0 HeadlessChrome/128.0')).toBe(true);
    expect(isBot('')).toBe(true);
    expect(isBot(CHROME_MAC)).toBe(false);
  });

  it('classifies devices', () => {
    expect(deviceOf(CHROME_MAC)).toBe('desktop');
    expect(deviceOf(SAFARI_IPHONE)).toBe('mobile');
    expect(deviceOf(ANDROID_TABLET)).toBe('tablet');
  });

  it('names browsers, most specific first', () => {
    expect(browserOf(EDGE)).toBe('Edge');
    expect(browserOf(CHROME_MAC)).toBe('Chrome');
    expect(browserOf(SAFARI_IPHONE)).toBe('Safari');
    expect(browserOf(FIREFOX)).toBe('Firefox');
    expect(browserOf('Mozilla/5.0 OPR/110')).toBe('Opera');
    expect(browserOf('SamsungBrowser/25 Chrome/121')).toBe('Samsung Internet');
    expect(browserOf('curl')).toBe('Other');
  });
});

describe('request signals', () => {
  it('accepts only ISO country codes', () => {
    expect(countryOf('de')).toBe('DE');
    expect(countryOf('XYZ')).toBeNull();
    expect(countryOf(null)).toBeNull();
  });

  it('honours Do Not Track and Global Privacy Control', () => {
    expect(optedOut(new Headers({ dnt: '1' }))).toBe(true);
    expect(optedOut(new Headers({ 'sec-gpc': '1' }))).toBe(true);
    expect(optedOut(new Headers())).toBe(false);
  });

  it('recognises the admin session cookie', () => {
    expect(isAdminSession(['sb-zkvp-auth-token.0'])).toBe(true);
    expect(isAdminSession(['theme', 'other'])).toBe(false);
  });
});
