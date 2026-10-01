import { render, screen } from '@testing-library/react';

jest.mock('../../actions', () => ({ sendMagicLink: jest.fn() }));

import AdminLoginPage from '../page';

describe('AdminLoginPage', () => {
  it('shows the email form by default', () => {
    render(<AdminLoginPage searchParams={{}} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a neutral confirmation after sending', () => {
    render(<AdminLoginPage searchParams={{ sent: '1' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('If that address may sign in');
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('explains a failed login link', () => {
    render(<AdminLoginPage searchParams={{ error: '1' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('did not work');
  });
});
