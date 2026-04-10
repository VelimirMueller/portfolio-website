import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPage from './error';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'errorPage.heading': 'Something went wrong',
      'errorPage.description': 'An unexpected error occurred. Try refreshing the page or use the links below.',
      'errorPage.retry': 'Try Again',
      'errorPage.home': 'Home',
      'errorPage.projects': 'Projects',
      'errorPage.contact': 'Contact',
    };
    return map[key] ?? key;
  },
}));

jest.mock('@/components/atoms/AnimateIn', () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ErrorPage', () => {
  it('renders error heading and retry button', () => {
    const reset = jest.fn();
    render(<ErrorPage error={new Error('test')} reset={reset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Try Again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('renders navigation quick links', () => {
    render(<ErrorPage error={new Error('test')} reset={jest.fn()} />);
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });
});
