import { OPT_OUT_EVENT, OPT_OUT_KEY, browserSignalsOptOut, isOptedOut, setOptedOut } from '../optOut';

describe('analytics opt-out', () => {
  beforeEach(() => window.localStorage.clear());

  it('remembers an objection and its withdrawal, and tells listeners', () => {
    const seen: boolean[] = [];
    const listener = (e: Event) => seen.push((e as CustomEvent<boolean>).detail);
    window.addEventListener(OPT_OUT_EVENT, listener);
    expect(isOptedOut()).toBe(false);
    expect(setOptedOut(true)).toBe(true);
    expect(window.localStorage.getItem(OPT_OUT_KEY)).toBe('1');
    expect(isOptedOut()).toBe(true);
    setOptedOut(false);
    expect(window.localStorage.getItem(OPT_OUT_KEY)).toBeNull();
    expect(seen).toEqual([true, false]);
    window.removeEventListener(OPT_OUT_EVENT, listener);
  });

  it('survives blocked storage', () => {
    const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(isOptedOut()).toBe(false);
    expect(setOptedOut(true)).toBe(false);
    get.mockRestore();
    set.mockRestore();
  });

  it('reads Do Not Track and Global Privacy Control', () => {
    expect(browserSignalsOptOut({ doNotTrack: '1' } as Navigator)).toBe(true);
    expect(browserSignalsOptOut({ doNotTrack: null, globalPrivacyControl: true } as unknown as Navigator)).toBe(true);
    expect(browserSignalsOptOut({ doNotTrack: null } as Navigator)).toBe(false);
  });
});
