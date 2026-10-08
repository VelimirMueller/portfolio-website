import { act, fireEvent, render, screen } from '@testing-library/react';
import { MagicCollection } from '../MagicCollection';
import { poolCard as card } from '../../../_lib/magic/testFixtures';

const cards = [
  card({ id: 'a', name: 'Unsummon', type_line: 'Instant', mana_value: 1, oracle_text: "Return target creature to its owner's hand.", owned_qty: 2 }),
  card({ id: 'b', name: 'Memory Trap', colors: ['W'], type_line: 'Enchantment', note: 'Good removal.', copies_de: 1, image_url: null }),
  card({ id: 'c', name: 'Fell Grasp', type_line: 'Instant', status: 'verify', mana_cost: null, mana_value: null }),
];

describe('MagicCollection', () => {
  it('shows every card with image, text, notes and totals', () => {
    render(<MagicCollection cards={cards} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByText('3 of 3 cards')).toBeInTheDocument();
    expect(screen.getByText('Good removal.')).toBeInTheDocument();
    expect(screen.getByText('verify')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Unsummon' })).toHaveAttribute('src', expect.stringContaining('/small/'));
    expect(screen.getByRole('img', { name: 'Memory Trap (no image)' })).toBeInTheDocument();
    expect(screen.getByText('Copies').nextSibling).toHaveTextContent('4');
    expect(screen.getByText('Text from photos').nextSibling).toHaveTextContent('1');
  });

  it('keeps the full text behind a disclosure', () => {
    render(<MagicCollection cards={cards} />);
    expect(screen.getByText("Return target creature to its owner's hand.").closest('details')).not.toBeNull();
  });

  it('filters by search text, color and type', () => {
    render(<MagicCollection cards={cards} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cards' }), { target: { value: 'owner' } });
    expect(screen.getByText('1 of 3 cards')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cards' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'White' }));
    expect(screen.getByRole('button', { name: 'White' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 of 3 cards')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Instant/ }));
    expect(screen.getByText('No card matches these filters.')).toBeInTheDocument();
  });

  it('changes the count through the action, and asks before removing the last copy', async () => {
    const changeQty = jest.fn(async () => {});
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<MagicCollection cards={cards} actions={{ changeQty }} />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'One copy more of Unsummon' })));
    expect(changeQty).toHaveBeenCalledWith('a', 1);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'One copy less of Unsummon' })));
    expect(changeQty).toHaveBeenCalledWith('a', -1);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Remove Memory Trap' })));
    expect(confirm).toHaveBeenCalled();
    expect(changeQty).toHaveBeenCalledTimes(2);
    confirm.mockRestore();
  });

  it('tells you when a count change was not saved', async () => {
    const changeQty = jest.fn(async () => {
      throw new Error('Could not change the count');
    });
    render(<MagicCollection cards={cards} actions={{ changeQty }} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'One copy more of Unsummon' })));
    expect(screen.getByRole('alert')).toHaveTextContent('Not saved');
  });

  it('says so when the pool is empty', () => {
    render(<MagicCollection cards={[]} />);
    expect(screen.getByText('The pool is empty.')).toBeInTheDocument();
  });
});
