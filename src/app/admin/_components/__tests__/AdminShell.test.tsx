import { fireEvent, render, screen } from '@testing-library/react';

let params = new URLSearchParams();
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/11111111-1111-4111-8111-111111111111',
  useSearchParams: () => params,
}));
jest.mock('../../actions', () => ({ signOut: jest.fn() }));

import { AdminShell } from '../AdminShell';

describe('AdminShell', () => {
  it('highlights Inbox on a message page and shows the unread count', () => {
    render(<AdminShell unread={3} email="me@example.com">content</AdminShell>);
    const inbox = screen.getByRole('link', { name: /Inbox/ });
    expect(inbox).toHaveAttribute('aria-current', 'page');
    expect(inbox).toHaveTextContent('3');
    expect(screen.getByText('me@example.com')).toBeInTheDocument();
  });

  it('hides the count when nothing is unread', () => {
    render(<AdminShell unread={0} email="">content</AdminShell>);
    expect(screen.getByRole('link', { name: /Inbox/ })).toHaveTextContent(/^Inbox$/);
  });

  it('keeps the status filter when searching', () => {
    params = new URLSearchParams('status=archived&q=acme');
    render(<AdminShell unread={0} email="">content</AdminShell>);
    expect(screen.getByRole('searchbox', { name: 'Search messages' })).toHaveValue('acme');
    expect(document.querySelector('input[name="status"]')).toHaveValue('archived');
    params = new URLSearchParams();
  });

  it('opens and closes the mobile menu', () => {
    render(<AdminShell unread={0} email="">content</AdminShell>);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});
