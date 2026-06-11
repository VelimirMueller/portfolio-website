import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '../useReducedMotion';

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Listener[] = [];
  const mql = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: jest.fn((_: string, cb: Listener) => listeners.push(cb)),
    removeEventListener: jest.fn((_: string, cb: Listener) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    }),
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockReturnValue(mql),
  });
  return { mql, listeners };
}

describe('useReducedMotion', () => {
  it('returns false when the user has no reduced-motion preference', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the user prefers reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the preference changes at runtime', () => {
    const { listeners } = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach((cb) => cb({ matches: true }));
    });
    expect(result.current).toBe(true);
  });

  it('removes its listener on unmount', () => {
    const { mql } = mockMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
