import React from 'react';
import { renderToString } from 'react-dom/server';
import { render, act } from '@testing-library/react';
import { AnimateIn } from '../AnimateIn';

type IOCallback = (
  entries: Array<{ target: Element; isIntersecting: boolean }>
) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IOCallback;
  options?: IntersectionObserverInit;
  observed: Element[] = [];

  constructor(callback: IOCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve(el: Element) {
    this.observed = this.observed.filter((o) => o !== el);
  }
  disconnect() {
    this.observed = [];
  }
  fire(el: Element, isIntersecting: boolean) {
    act(() => this.callback([{ target: el, isIntersecting }]));
  }
}

function mockMatchMedia(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockReturnValue({
      matches: reduced,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
}

/** Puts every element at `top` px from the viewport top (jsdom has no layout). */
function placeAt(top: number) {
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: top, toJSON: () => ({}),
  } as DOMRect);
}
const BELOW_FOLD = 5000;

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
  mockMatchMedia(false);
  placeAt(0);
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

// AnimateIn keeps a module-level observer per threshold, so each test uses a
// unique threshold to get a fresh observer instance.
let nextThreshold = 0.01;
const uniqueThreshold = () => (nextThreshold += 0.01);

const wrapperOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const lastObserver = () => MockIntersectionObserver.instances.at(-1)!;

describe('AnimateIn', () => {
  describe('first paint', () => {
    it('server-renders the content visible, with no inline style', () => {
      const html = renderToString(
        <AnimateIn threshold={uniqueThreshold()}>
          <p>content</p>
        </AnimateIn>
      );
      expect(html).toContain('content');
      expect(html).not.toContain('style=');
    });

    it('leaves content that is already in view untouched', () => {
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()}>
          <p>content</p>
        </AnimateIn>
      );
      expect(wrapperOf(container).getAttribute('style')).toBeFalsy();
      expect(lastObserver()?.observed ?? []).toHaveLength(0);
    });
  });

  describe('below the fold', () => {
    beforeEach(() => placeAt(BELOW_FOLD));

    it('offsets the block until it scrolls into view', () => {
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()} distance={30}>
          <p>content</p>
        </AnimateIn>
      );
      expect(wrapperOf(container).style.transform).toBe('translate(0, 30px)');
    });

    it('slides into place when it intersects, then drops the inline styles', () => {
      jest.useFakeTimers();
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()} delay={100} duration={400}>
          <p>content</p>
        </AnimateIn>
      );
      const wrapper = wrapperOf(container);

      lastObserver().fire(wrapper, true);
      expect(wrapper.style.transform).toBe('translate(0, 0)');
      expect(wrapper.style.transition).toContain('transform 400ms');
      expect(wrapper.style.transitionDelay).toBe('100ms');

      act(() => jest.advanceTimersByTime(100 + 400 + 50));
      expect(wrapper.getAttribute('style')).toBeFalsy();
    });

    it('stops observing after the first reveal by default', () => {
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()}>
          <p>content</p>
        </AnimateIn>
      );
      const wrapper = wrapperOf(container);
      const observer = lastObserver();
      observer.fire(wrapper, true);
      expect(observer.observed).not.toContain(wrapper);
    });

    it('offsets the block again when it leaves below the viewport and once is false', () => {
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()} once={false}>
          <p>content</p>
        </AnimateIn>
      );
      const wrapper = wrapperOf(container);
      const observer = lastObserver();
      observer.fire(wrapper, true);
      expect(wrapper.style.transform).toBe('translate(0, 0)');
      observer.fire(wrapper, false);
      expect(wrapper.style.transform).toBe('translate(0, 24px)');
    });

    it.each([
      ['top', 'translate(0, -10px)'],
      ['left', 'translate(-10px, 0)'],
      ['right', 'translate(10px, 0)'],
      ['bottom-left', 'translate(-7px, 10px)'],
      ['bottom-right', 'translate(7px, 10px)'],
    ] as const)('offsets from the %s', (from, transform) => {
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()} from={from} distance={10}>
          <p>content</p>
        </AnimateIn>
      );
      expect(wrapperOf(container).style.transform).toBe(transform);
    });

    it('never uses opacity, filter or will-change, so glass inside keeps its blur', () => {
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()}>
          <p>content</p>
        </AnimateIn>
      );
      const wrapper = wrapperOf(container);
      const assertNoBackdropRoot = () => {
        expect(wrapper.style.opacity).toBe('');
        expect(wrapper.style.filter).toBe('');
        expect(wrapper.style.willChange).toBe('');
      };
      assertNoBackdropRoot();
      lastObserver().fire(wrapper, true);
      assertNoBackdropRoot();
    });
  });

  describe('without motion', () => {
    beforeEach(() => placeAt(BELOW_FOLD));

    it('does not animate when reduced motion is preferred', () => {
      mockMatchMedia(true);
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()}>
          <p>content</p>
        </AnimateIn>
      );
      expect(wrapperOf(container).getAttribute('style')).toBeFalsy();
    });

    it('shows the content in place when IntersectionObserver is missing', () => {
      Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: undefined });
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()}>
          <p>content</p>
        </AnimateIn>
      );
      expect(wrapperOf(container).getAttribute('style')).toBeFalsy();
    });
  });

  describe('invalid props', () => {
    beforeEach(() => placeAt(BELOW_FOLD));

    it('falls back to the defaults for negative or non-finite timings and distance', () => {
      const { container } = render(
        <AnimateIn threshold={uniqueThreshold()} delay={-50} duration={Number.NaN} distance={-10}>
          <p>content</p>
        </AnimateIn>
      );
      const wrapper = wrapperOf(container);
      expect(wrapper.style.transform).toBe('translate(0, 24px)');
      lastObserver().fire(wrapper, true);
      expect(wrapper.style.transition).toContain('transform 600ms');
      expect(wrapper.style.transitionDelay).toBe('0ms');
    });

    it('clamps the threshold into [0, 1] instead of letting IntersectionObserver throw', () => {
      render(
        <AnimateIn threshold={7}>
          <p>content</p>
        </AnimateIn>
      );
      expect(lastObserver().options?.threshold).toBe(1);
    });

    it('uses the default threshold when it is not a number', () => {
      render(
        <AnimateIn threshold={Number.POSITIVE_INFINITY}>
          <p>content</p>
        </AnimateIn>
      );
      expect(lastObserver().options?.threshold).toBe(0.1);
    });

    it('slides up from the bottom for an unknown direction', () => {
      const { container } = render(
        // @ts-expect-error: a wrong value from untyped callers
        <AnimateIn threshold={uniqueThreshold()} from="sideways">
          <p>content</p>
        </AnimateIn>
      );
      expect(wrapperOf(container).style.transform).toBe('translate(0, 24px)');
    });
  });

  it('shares one observer across elements with the same threshold', () => {
    placeAt(BELOW_FOLD);
    const threshold = uniqueThreshold();
    render(
      <>
        <AnimateIn threshold={threshold}>
          <p>one</p>
        </AnimateIn>
        <AnimateIn threshold={threshold}>
          <p>two</p>
        </AnimateIn>
      </>
    );
    const sharing = MockIntersectionObserver.instances.filter(
      (i) => i.observed.length > 0
    );
    expect(sharing).toHaveLength(1);
    expect(sharing[0].observed).toHaveLength(2);
  });

  it('stops observing on unmount', () => {
    placeAt(BELOW_FOLD);
    const { unmount } = render(
      <AnimateIn threshold={uniqueThreshold()}>
        <p>content</p>
      </AnimateIn>
    );
    const observer = lastObserver();
    expect(observer.observed).toHaveLength(1);
    unmount();
    expect(observer.observed).toHaveLength(0);
  });

  it('renders a custom element via the `as` prop', () => {
    const { container } = render(
      <AnimateIn as="section" threshold={uniqueThreshold()}>
        <p>content</p>
      </AnimateIn>
    );
    expect(container.querySelector('section')).not.toBeNull();
  });
});
