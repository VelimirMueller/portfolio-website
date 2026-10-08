import { fireEvent, render, screen } from '@testing-library/react';

let pathname = '/admin';
jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));
jest.mock('../../actions', () => ({ signOut: jest.fn() }));

import { AdminShell } from '../AdminShell';

describe('AdminShell', () => {
  it('highlights Inbox on /admin and shows the unread count only there', () => {
    pathname = '/admin';
    render(<AdminShell unread={3} email="me@example.com">content</AdminShell>);
    const inbox = screen.getByRole('link', { name: /Inbox/ });
    expect(inbox).toHaveAttribute('aria-current', 'page');
    expect(inbox).toHaveTextContent('3');
    expect(screen.getByRole('link', { name: 'KPIs' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('me@example.com')).toBeInTheDocument();
  });

  it('highlights KPIs on the KPI page, not Inbox', () => {
    pathname = '/admin/kpis';
    render(<AdminShell unread={0} email="">content</AdminShell>);
    expect(screen.getByRole('link', { name: 'KPIs' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Inbox/ })).not.toHaveAttribute('aria-current');
    pathname = '/admin';
  });

  it('highlights Magic on the collection page', () => {
    pathname = '/admin/magic';
    render(<AdminShell unread={0} email="">content</AdminShell>);
    expect(screen.getByRole('link', { name: 'Magic' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'KPIs' })).not.toHaveAttribute('aria-current');
    pathname = '/admin';
  });

  it('hides the count when nothing is unread', () => {
    render(<AdminShell unread={0} email="">content</AdminShell>);
    expect(screen.getByRole('link', { name: /Inbox/ })).toHaveTextContent(/^Inbox$/);
  });

  it('shows the app version under the logo when given', () => {
    render(<AdminShell unread={0} email="" version="2.0.0">content</AdminShell>);
    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
  });

  it('opens and closes the mobile menu', () => {
    render(<AdminShell unread={0} email="">content</AdminShell>);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});
