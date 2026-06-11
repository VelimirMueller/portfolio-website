import { createRateLimiter } from '../rateLimit';

describe('createRateLimiter', () => {
  it('allows requests up to the limit within a window', () => {
    const check = createRateLimiter({ windowMs: 1000, max: 3 });
    expect(check('1.2.3.4', 0)).toBe(true);
    expect(check('1.2.3.4', 100)).toBe(true);
    expect(check('1.2.3.4', 200)).toBe(true);
  });

  it('blocks requests beyond the limit within a window', () => {
    const check = createRateLimiter({ windowMs: 1000, max: 3 });
    check('1.2.3.4', 0);
    check('1.2.3.4', 100);
    check('1.2.3.4', 200);
    expect(check('1.2.3.4', 300)).toBe(false);
  });

  it('tracks different keys independently', () => {
    const check = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(check('1.2.3.4', 0)).toBe(true);
    expect(check('5.6.7.8', 0)).toBe(true);
    expect(check('1.2.3.4', 10)).toBe(false);
  });

  it('allows requests again after the window expires', () => {
    const check = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(check('1.2.3.4', 0)).toBe(true);
    expect(check('1.2.3.4', 500)).toBe(false);
    expect(check('1.2.3.4', 1000)).toBe(true);
  });

  it('evicts expired entries so the map does not grow unbounded', () => {
    const check = createRateLimiter({ windowMs: 1000, max: 1, maxKeys: 5 });
    for (let i = 0; i < 5; i++) {
      check(`ip-${i}`, 0);
    }
    // All previous windows expired; a new key must still be accepted
    expect(check('fresh-ip', 2000)).toBe(true);
    // And previously seen keys get a fresh window after expiry
    expect(check('ip-0', 2000)).toBe(true);
  });
});
