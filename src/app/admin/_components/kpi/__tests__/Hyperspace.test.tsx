import React, { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { Hyperspace, type HyperspaceHandle } from '../Hyperspace';

function stubContext() {
  const calls = { fillRect: 0, stroke: 0, gradient: 0 };
  const ctx = {
    setTransform: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(() => calls.fillRect++),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(() => calls.stroke++),
    createRadialGradient: jest.fn(() => (calls.gradient++, { addColorStop: jest.fn() })),
    set fillStyle(_v: unknown) {},
    set strokeStyle(_v: unknown) {},
    set lineWidth(_v: unknown) {},
  };
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ctx) as unknown as HTMLCanvasElement['getContext'];
  return calls;
}

describe('Hyperspace', () => {
  let frames: FrameRequestCallback[] = [];
  let now = 0;
  beforeEach(() => {
    frames = [];
    now = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => (frames.push(cb), frames.length));
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    Object.defineProperty(HTMLCanvasElement.prototype, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(HTMLCanvasElement.prototype, 'clientHeight', { value: 60, configurable: true });
    window.matchMedia = jest.fn(() => ({ matches: false })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => jest.restoreAllMocks());

  const tick = (ms: number) => {
    now += ms;
    const run = frames;
    frames = [];
    run.forEach((cb) => cb(now));
  };

  it('drifts as dots, then streaks and flashes during a jump', () => {
    const calls = stubContext();
    const ref = createRef<HyperspaceHandle>();
    render(<Hyperspace ref={ref} />);
    for (let i = 0; i < 30; i++) tick(16);
    expect(calls.fillRect).toBeGreaterThan(0);
    expect(calls.stroke).toBe(0);

    act(() => ref.current?.jump(400));
    for (let i = 0; i < 12; i++) tick(16);
    expect(calls.stroke).toBeGreaterThan(0);
    expect(calls.gradient).toBeGreaterThan(0);

    // The burst ends and the field settles back to dots.
    for (let i = 0; i < 60; i++) tick(16);
    const strokes = calls.stroke;
    tick(16);
    expect(calls.stroke).toBe(strokes);
  });

  it('draws one still frame and never jumps with reduced motion', () => {
    window.matchMedia = jest.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia;
    const calls = stubContext();
    const ref = createRef<HyperspaceHandle>();
    render(<Hyperspace ref={ref} />);
    expect(frames).toHaveLength(0);
    act(() => ref.current?.jump(400));
    expect(calls.stroke).toBe(0);
    expect(calls.gradient).toBe(0);
  });
});
