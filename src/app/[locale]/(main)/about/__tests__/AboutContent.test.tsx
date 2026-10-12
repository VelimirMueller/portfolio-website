/**
 * The experience timeline renders all seven entries from the EXPERIENCE array in both locales.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import AboutContent from '../AboutContent';

let mockMessages: Record<string, unknown> = en;

jest.mock('next-intl', () => {
  const resolve = (key: string): unknown =>
    key.split('.').reduce<unknown>(
      (acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined),
      mockMessages
    );
  return {
    useTranslations: () => {
      const t = (key: string) => {
        const value = resolve(key);
        return typeof value === 'string' ? value : key;
      };
      t.raw = (key: string) => resolve(key);
      return t;
    },
  };
});

jest.mock('@/components/atoms/AnimateIn', () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const EXPERIENCE_KEYS = ['exp1', 'exp2', 'exp3', 'exp4', 'exp5', 'exp6', 'exp7'] as const;

const timelineItems = () => {
  const timeline = screen.getAllByRole('list').find((list) => list.querySelector('[data-testid="timeline-node"]'));
  expect(timeline).toBeDefined();
  return within(timeline as HTMLElement).getAllByRole('listitem');
};

describe.each([
  ['en', en],
  ['de', de],
] as const)('AboutContent experience timeline (%s)', (_locale, messages) => {
  beforeEach(() => {
    mockMessages = messages;
  });

  it('renders all seven entries in order with their copy', () => {
    render(<AboutContent />);
    const items = timelineItems();
    expect(items).toHaveLength(EXPERIENCE_KEYS.length);
    EXPERIENCE_KEYS.forEach((key, i) => {
      const entry = messages.about[key];
      expect(within(items[i]).getByRole('heading', { name: entry.title })).toBeInTheDocument();
      expect(within(items[i]).getByText(entry.tag)).toBeInTheDocument();
      expect(within(items[i]).getByText(entry.company)).toBeInTheDocument();
      expect(within(items[i]).getByText(entry.date)).toBeInTheDocument();
      expect(within(items[i]).getByText(entry.desc)).toBeInTheDocument();
    });
  });

  it('marks the first entry as the current role', () => {
    render(<AboutContent />);
    const current = timelineItems().filter((li) => li.getAttribute('aria-current') === 'true');
    expect(current).toHaveLength(1);
    expect(within(current[0]).getByText(messages.about.current)).toBeInTheDocument();
    expect(within(current[0]).getByRole('heading', { name: messages.about.exp1.title })).toBeInTheDocument();
  });
});
