import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('../../actions', () => ({ deleteMessage: jest.fn() }));

import { DeleteButton } from '../DeleteButton';

describe('DeleteButton', () => {
  it('needs a second, explicit confirmation', () => {
    render(<DeleteButton id="abc" />);
    expect(screen.queryByRole('button', { name: 'Yes, delete' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
  });

  it('can be disarmed again', () => {
    render(<DeleteButton id="abc" />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
