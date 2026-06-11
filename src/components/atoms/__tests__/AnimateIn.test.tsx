import React from 'react';
import { render, act } from '@testing-library/react';
import { AnimateIn } from '../AnimateIn';

type IOCallback = (
  entries: Array<{ target: Element; isIntersecting: boolean }>
) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IOCallback;
  observed: Element[] = [];

  constructor(callback: IOCallback) {
    this.callback = callback;
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
  intersect(el: Element) {
    act(() => this.callback([{ target: el, isIntersecting: true }]));
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

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });
  mockMatchMedia(false);
});

// AnimateIn keeps a module-level observer per threshold, so each test uses a
// unique threshold to get a fresh observer instance.
let nextThreshold = 0.01;
const uniqueThreshold = () => (nextThreshold += 0.01);

describe('AnimateIn', () => {
  it('renders children hidden before the element intersects', () => {
    const { container } = render(
      <AnimateIn threshold={uniqueThreshold()}>
        <p>content</p>
      </AnimateIn>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0');
    expect(wrapper.style.transform).not.toBe('translate(0, 0)');
  });

  it('becomes visible when the element intersects', () => {
    const { container } = render(
      <AnimateIn threshold={uniqueThreshold()}>
        <p>content</p>
      </AnimateIn>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const observer = MockIntersectionObserver.instances.at(-1)!;

    observer.intersect(wrapper);

    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transform).toBe('translate(0, 0)');
  });

  it('skips the animation entirely when reduced motion is preferred', () => {
    mockMatchMedia(true);
    const { container } = render(
      <AnimateIn threshold={uniqueThreshold()}>
        <p>content</p>
      </AnimateIn>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('');
    expect(wrapper.style.transform).toBe('');
  });

  it('shares one observer across elements with the same threshold', () => {
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

  it('renders a custom element via the `as` prop', () => {
    const { container } = render(
      <AnimateIn as="section" threshold={uniqueThreshold()}>
        <p>content</p>
      </AnimateIn>
    );
    expect(container.querySelector('section')).not.toBeNull();
  });
});
