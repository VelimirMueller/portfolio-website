import React from 'react';
import { render, fireEvent } from '@testing-library/react';

let mockPathname = '/de';
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));

import { Analytics, trackingAllowed } from '../Analytics';

const sendBeacon = jest.fn((..._args: unknown[]) => true);

// jsdom's Blob has no .text(); FileReader works everywhere.
const readBlob = (blob: Blob) =>
  new Promise<unknown>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(JSON.parse(reader.result as string));
    reader.readAsText(blob);
  });

async function sent(): Promise<unknown[]> {
  return Promise.all(sendBeacon.mock.calls.map(([, blob]) => readBlob(blob as Blob)));
}

describe('Analytics', () => {
  beforeEach(() => {
    mockPathname = '/de';
    sendBeacon.mockClear().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
    Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true });
    Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/', configurable: true });
  });

  it('sends the landing page view with the referrer, then navigations with the previous path', async () => {
    const { rerender } = render(<Analytics />);
    mockPathname = '/de/contact';
    rerender(<Analytics />);
    expect(sendBeacon).toHaveBeenCalledWith('/api/collect', expect.any(Blob));
    expect(await sent()).toEqual([
      { t: 'pageview', p: '/de', r: 'https://www.google.com/' },
      { t: 'pageview', p: '/de/contact', v: '/de' },
    ]);
  });

  it('prefers utm_source over the browser referrer', async () => {
    window.history.replaceState(null, '', '/de?utm_source=newsletter');
    render(<Analytics />);
    expect((await sent())[0]).toMatchObject({ r: 'newsletter' });
    window.history.replaceState(null, '', '/');
  });

  it('sends labelled clicks and ignores the rest', async () => {
    const { getByText } = render(
      <div>
        <Analytics />
        <button data-track="hero:contact">Contact</button>
        <p>plain</p>
      </div>
    );
    sendBeacon.mockClear();
    fireEvent.click(getByText('Contact'));
    fireEvent.click(getByText('plain'));
    expect(await sent()).toEqual([{ t: 'click', p: window.location.pathname, e: 'hero:contact' }]);
  });

  it('falls back to fetch keepalive when sendBeacon refuses', () => {
    sendBeacon.mockReturnValue(false);
    const fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<Analytics />);
    expect(fetchMock).toHaveBeenCalledWith('/api/collect', expect.objectContaining({ method: 'POST', keepalive: true }));
  });

  it('sends nothing with Do Not Track', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    const { container } = render(<Analytics />);
    fireEvent.click(container);
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});

describe('trackingAllowed', () => {
  it('respects Global Privacy Control', () => {
    expect(trackingAllowed({ doNotTrack: null, globalPrivacyControl: true } as unknown as Navigator)).toBe(false);
    expect(trackingAllowed({ doNotTrack: null } as unknown as Navigator)).toBe(true);
  });
});
