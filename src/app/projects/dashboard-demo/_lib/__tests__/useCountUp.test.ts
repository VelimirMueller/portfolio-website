import { act, renderHook } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

describe('useCountUp', () => {
  let frames: FrameRequestCallback[] = [];
  const tick = (time: number) => {
    const queued = frames;
    frames = [];
    act(() => queued.forEach((cb) => cb(time)));
  };

  beforeEach(() => {
    frames = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('counts up with an ease-out curve and stops at the end value', () => {
    const { result } = renderHook(() => useCountUp(1000, 1000));
    expect(result.current).toBe(0);
    tick(1); // first frame sets the start time
    tick(501); // half the time: ease-out is ahead of linear
    expect(result.current).toBe(875);
    tick(2001);
    expect(result.current).toBe(1000);
    expect(frames).toHaveLength(0); // no frame after the end
  });

  it('cancels its frame on unmount', () => {
    const { unmount } = renderHook(() => useCountUp(10));
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
