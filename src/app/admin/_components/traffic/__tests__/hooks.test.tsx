import { act, renderHook } from '@testing-library/react';
import { usePrefersReducedMotion, useCountUp } from '../hooks';

type Listener = () => void;

function mockMatchMedia(matches: boolean) {
  const listeners: Listener[] = [];
  const mql = {
    matches,
    addEventListener: jest.fn((_: string, cb: Listener) => listeners.push(cb)),
    removeEventListener: jest.fn(),
  };
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: jest.fn().mockReturnValue(mql) });
  return { mql, listeners };
}

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: undefined });
});

describe('usePrefersReducedMotion', () => {
  it('is false without matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: undefined });
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('follows the preference, also when it changes', () => {
    const { mql, listeners } = mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);

    act(() => {
      mql.matches = false;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(false);
  });
});

describe('useCountUp', () => {
  it('jumps straight to each new value with reduced motion', () => {
    mockMatchMedia(true);
    const { result, rerender } = renderHook(({ end }) => useCountUp(end), { initialProps: { end: 120 } });
    expect(result.current).toBe(120);

    rerender({ end: 300 });
    expect(result.current).toBe(300);
  });

  it('counts up to the value without reduced motion', () => {
    mockMatchMedia(false);
    let now = 0;
    const frames: FrameRequestCallback[] = [];
    const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    const { result } = renderHook(() => useCountUp(100, 900));

    const tick = (t: number) =>
      act(() => {
        now = t;
        frames.splice(0).forEach((cb) => cb(now));
      });
    tick(0);
    expect(result.current).toBe(0);
    tick(450);
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);
    tick(900);
    expect(result.current).toBe(100);
    raf.mockRestore();
  });
});
