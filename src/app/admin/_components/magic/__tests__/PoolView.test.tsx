import { act, fireEvent, render, screen } from '@testing-library/react';
import { PoolView } from '../PoolView';
import { poolEntry } from '../../../_lib/magic/testFixtures';

const entries = [
  poolEntry(
    { name: 'Unsummon', type_line: 'Instant', mana_value: 1, oracle_text: "Return target creature to its owner's hand." },
    { owned_qty: 2 }
  ),
  poolEntry(
    { name: 'Memory Trap', colors: ['W'], type_line: 'Enchantment', image_url: null, rarity: 'common' },
    { note: 'One copy is foil.', copies_de: 1 }
  ),
  poolEntry({ name: 'Last Gasp', colors: ['B'], type_line: 'Instant', rarity: 'common' }, { name_de: 'Letzter Atemzug' }),
];

describe('PoolView', () => {
  it('shows every card with image, rules text, German name, note and totals', () => {
    render(<PoolView entries={entries} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByText('3 of 3 cards')).toBeInTheDocument();
    expect(screen.getByText("Return target creature to its owner's hand.")).toBeInTheDocument();
    expect(screen.getByText('Letzter Atemzug')).toBeInTheDocument();
    expect(screen.getByText('One copy is foil.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Unsummon' })).toHaveAttribute('src', expect.stringContaining('/admin/magic/img/small/'));
    expect(screen.getByRole('img', { name: 'Memory Trap (no image)' })).toBeInTheDocument();
    expect(screen.getByText('Copies').nextSibling).toHaveTextContent('4');
    expect(screen.getByText('Rares & mythics').nextSibling).toHaveTextContent('1');
  });

  it('filters by search text, color and type', () => {
    render(<PoolView entries={entries} />);
    const search = screen.getByRole('searchbox', { name: 'Search cards' });
    fireEvent.change(search, { target: { value: 'atemzug' } });
    expect(screen.getByText('1 of 3 cards')).toBeInTheDocument();
    fireEvent.change(search, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'White' }));
    expect(screen.getByRole('button', { name: 'White' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 of 3 cards')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Instant/ }));
    expect(screen.getByText('No card matches these filters.')).toBeInTheDocument();
  });

  it('changes the count, and asks before removing the last copy', async () => {
    const changeQty = jest.fn(async () => {});
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<PoolView entries={entries} changeQty={changeQty} />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'One copy more of Unsummon' })));
    expect(changeQty).toHaveBeenCalledWith(entries[0].id, 1);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'One copy less of Unsummon' })));
    expect(changeQty).toHaveBeenCalledWith(entries[0].id, -1);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Remove Memory Trap' })));
    expect(confirm).toHaveBeenCalled();
    expect(changeQty).toHaveBeenCalledTimes(2);
    confirm.mockRestore();
  });

  it('tells you when a count change was not saved', async () => {
    const changeQty = jest.fn(async () => {
      throw new Error('Could not change the count');
    });
    render(<PoolView entries={entries} changeQty={changeQty} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'One copy more of Unsummon' })));
    expect(screen.getByRole('alert')).toHaveTextContent('Not saved');
  });

  it('shows plain counts without actions, and says when the pool is empty', () => {
    const { unmount } = render(<PoolView entries={entries} />);
    expect(screen.queryByRole('button', { name: /One copy more/ })).not.toBeInTheDocument();
    unmount();
    render(<PoolView entries={[]} />);
    expect(screen.getByText('The pool is empty.')).toBeInTheDocument();
  });
});
