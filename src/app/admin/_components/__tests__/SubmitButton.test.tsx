import { render, screen } from '@testing-library/react';
import { useFormStatus } from 'react-dom';
import { SubmitButton } from '../SubmitButton';

const mockedStatus = useFormStatus as jest.Mock;

describe('SubmitButton', () => {
  afterEach(() => mockedStatus.mockReturnValue({ pending: false }));

  it('is a normal submit button while idle', () => {
    render(<SubmitButton pendingLabel="Sending…">Send login link</SubmitButton>);
    const button = screen.getByRole('button', { name: 'Send login link' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeEnabled();
  });

  it('disables itself while the action runs, so it cannot fire twice', () => {
    mockedStatus.mockReturnValue({ pending: true });
    render(<SubmitButton pendingLabel="Sending…">Send login link</SubmitButton>);
    const button = screen.getByRole('button', { name: 'Sending…' });
    expect(button).toBeDisabled();
  });
});
