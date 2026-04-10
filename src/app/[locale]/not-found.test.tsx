import { render, screen } from '@testing-library/react';
import NotFoundPage from './not-found';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'notFound.title': '404',
      'notFound.heading': 'Page not found',
      'notFound.description': "This route doesn't resolve. Here's where you probably meant to go:",
      'notFound.home': 'Home',
      'notFound.projects': 'Projects',
      'notFound.contact': 'Contact',
    };
    return map[key] ?? key;
  },
}));

jest.mock('@/components/atoms/AnimateIn', () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('NotFoundPage', () => {
  it('renders 404 heading and quick links', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact');
  });
});
