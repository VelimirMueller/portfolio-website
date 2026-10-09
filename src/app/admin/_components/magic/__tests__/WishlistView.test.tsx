import { act, fireEvent, render, screen } from '@testing-library/react';
import { WishlistView } from '../WishlistView';
import { wishEntry } from '../../../_lib/magic/testFixtures';

const entries = [
  wishEntry({ name: 'Rhystic Study', type_line: 'Enchantment' }, { qty: 2, note: 'Under 30 EUR.' }),
  wishEntry({ name: 'Counterspell', image_url: null }),
];

describe('WishlistView', () => {
  it('shows every wished card with image, note and totals', () => {
    render(<WishlistView entries={entries} changeQty={jest.fn()} wishToPool={jest.fn()} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(screen.getByText('2 cards · 3 copies wanted')).toBeInTheDocument();
    expect(screen.getByText('Under 30 EUR.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Rhystic Study' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Counterspell (no image)' })).toBeInTheDocument();
    expect(screen.getByLabelText('2 copies')).toHaveTextContent('×2');
  });

  it('changes the count, and asks before removing the last wanted copy', async () => {
    const changeQty = jest.fn(async () => {});
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<WishlistView entries={entries} changeQty={changeQty} wishToPool={jest.fn()} />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'One copy more of Rhystic Study' })));
    expect(changeQty).toHaveBeenCalledWith(entries[0].id, 1);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Remove Counterspell' })));
    expect(confirm).toHaveBeenCalledWith('Remove Counterspell from the wishlist?');
    expect(changeQty).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });

  it('moves a card into the pool with Got it', async () => {
    const wishToPool = jest.fn(async () => {});
    render(<WishlistView entries={entries} changeQty={jest.fn()} wishToPool={wishToPool} />);
    const gotIt = screen.getByRole('button', { name: 'Got it: move Rhystic Study to the pool' });
    expect(gotIt).toHaveTextContent('Got it');
    await act(async () => fireEvent.click(gotIt));
    expect(wishToPool).toHaveBeenCalledWith(entries[0].id);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tells you when Got it did not move the card', async () => {
    const wishToPool = jest.fn(async () => {
      throw new Error('Could not move the card');
    });
    render(<WishlistView entries={entries} changeQty={jest.fn()} wishToPool={wishToPool} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Got it: move Counterspell to the pool' })));
    expect(screen.getByRole('alert')).toHaveTextContent('Not moved');
  });

  it('points to Add card when the wishlist is empty', () => {
    render(<WishlistView entries={[]} changeQty={jest.fn()} wishToPool={jest.fn()} />);
    expect(screen.getByText(/Nothing on the wishlist/)).toHaveTextContent('Nothing on the wishlist. Use Add card → Want it.');
    expect(screen.getByRole('link', { name: 'Add card' })).toHaveAttribute('href', '/admin/magic/add');
  });
});
