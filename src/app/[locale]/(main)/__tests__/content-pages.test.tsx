/**
 * Render smoke tests for the localized content pages. They render each page
 * component with the real German message catalog so missing keys, broken
 * t.raw() shapes, or render crashes fail loudly.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import de from '@/locales/de.json';

import HomeContent from '../HomeContent';
import AboutContent from '../about/AboutContent';
import ServicesContent from '../services/ServicesContent';
import { ServiceDetailContent } from '../services/[serviceId]/ServiceDetailContent';
import PrivacyContent from '../privacy/PrivacyContent';
import ImprintContent from '../imprint/ImprintContent';
import ProjectsContent from '../projects/ProjectsContent';

jest.mock('next-intl', () => {
  const messages = jest.requireActual('@/locales/de.json');
  const resolve = (key: string): unknown =>
    key.split('.').reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      messages
    );

  return {
    useTranslations: () => {
      const t = (key: string) => {
        const value = resolve(key);
        return typeof value === 'string' ? value : key;
      };
      t.raw = (key: string) => resolve(key);
      t.rich = (key: string) => {
        const value = resolve(key);
        return typeof value === 'string' ? value : key;
      };
      return t;
    },
    useLocale: () => 'de',
  };
});

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('@/components/atoms/AnimateIn', () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => {
  const ReactActual = jest.requireActual<typeof React>('react');
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === '__esModule') return true;
        const Icon = (props: Record<string, unknown>) =>
          ReactActual.createElement('svg', {
            'data-testid': `icon-${String(prop)}`,
            'aria-hidden': true,
            ...props,
          });
        Icon.displayName = `MockIcon(${String(prop)})`;
        return Icon;
      },
    }
  );
});

describe('content pages render with the real German catalog', () => {
  it('HomeContent renders the hero and highlight card', () => {
    render(<HomeContent />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/VELIMIR/);
    expect(screen.getByText(de.home.highlightTitle)).toBeInTheDocument();
  });

  it('AboutContent renders the about copy', () => {
    render(<AboutContent />);
    expect(screen.getByText(de.about.title)).toBeInTheDocument();
  });

  it('ServicesContent renders title and value items from t.raw', () => {
    render(<ServicesContent />);
    expect(screen.getByText(de.services.title)).toBeInTheDocument();
    expect(screen.getByText(de.services.valueItems[0])).toBeInTheDocument();
  });

  it.each([
    'requirements-engineering',
    'ux-ui-branding',
    'frontend-development',
    'project-delivery',
    'modern-stack',
  ] as const)('ServiceDetailContent renders %s', (serviceId) => {
    render(<ServiceDetailContent serviceId={serviceId} />);
    expect(
      screen.getAllByText(de.serviceDetail[serviceId].title).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('PrivacyContent renders title and data list from t.raw', () => {
    render(<PrivacyContent />);
    expect(screen.getByText(de.privacy.title)).toBeInTheDocument();
    expect(screen.getByText(de.privacy.s3Data[0])).toBeInTheDocument();
  });

  it('ImprintContent renders the imprint details', () => {
    render(<ImprintContent />);
    expect(screen.getByText(de.imprint.title)).toBeInTheDocument();
  });

  it('ProjectsContent renders title and project check lists', () => {
    render(<ProjectsContent />);
    expect(screen.getByText(de.projects.title)).toBeInTheDocument();
    expect(screen.getByText(de.projects.saas.checks[0])).toBeInTheDocument();
  });
});
