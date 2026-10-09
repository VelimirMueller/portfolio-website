import { render, screen } from '@testing-library/react';
import { AddCardSearch } from '../AddCardSearch';
import { catalogCard } from '../../../_lib/magic/testFixtures';

const action = jest.fn(async () => {});

describe('AddCardSearch', () => {
  it('lists results with image, pool count and an add form', () => {
    const rift = catalogCard();
    render(
      <AddCardSearch
        query="rift"
        results={[rift]}
        owned={new Map([[rift.oracle_id, 1]])}
        wished={new Map([[rift.oracle_id, 3]])}
        catalogSize={32823}
        action={action}
      />
    );
    expect(screen.getByText('1 matches for “rift”')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Cyclonic Rift' })).toBeInTheDocument();
    expect(screen.getByText('in pool ×1')).toBeInTheDocument();
    expect(screen.getByText('wished ×3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Cyclonic Rift to the pool' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(rift.oracle_id)).toHaveAttribute('name', 'oracle_id');
    expect(screen.getByText(/32,823 cards from Scryfall/)).toBeInTheDocument();
  });

  it('submits the same form as owned or wanted, through name=intent', () => {
    const rift = catalogCard();
    render(<AddCardSearch query="rift" results={[rift]} owned={new Map()} wished={new Map()} catalogSize={1} action={action} />);
    const own = screen.getByRole('button', { name: 'Add Cyclonic Rift to the pool' });
    const want = screen.getByRole('button', { name: 'Add Cyclonic Rift to the wishlist' });
    expect(own).toHaveTextContent('Own it');
    expect(own).toHaveAttribute('name', 'intent');
    expect(own).toHaveAttribute('value', 'pool');
    expect(want).toHaveTextContent('Want it');
    expect(want).toHaveAttribute('name', 'intent');
    expect(want).toHaveAttribute('value', 'wish');
    expect(own.closest('form')).toBe(want.closest('form'));
    expect(screen.queryByText(/in pool ×|wished ×/)).not.toBeInTheDocument();
  });

  it('confirms a wished card', () => {
    render(<AddCardSearch query="" results={[]} owned={new Map()} wished={new Map()} wishedName="Opt" catalogSize={1} action={action} />);
    expect(screen.getByRole('status')).toHaveTextContent('Opt is on your wishlist.');
  });

  it('confirms an added card and explains an empty catalog', () => {
    render(<AddCardSearch query="" results={[]} owned={new Map()} wished={new Map()} added="Opt" catalogSize={null} action={action} />);
    expect(screen.getByRole('status')).toHaveTextContent('Opt is in your pool.');
    expect(screen.getByText(/The catalog is empty/)).toBeInTheDocument();
  });

  it('shows why the last add was refused', () => {
    render(<AddCardSearch query="" results={[]} owned={new Map()} wished={new Map()} formError="More German copies than copies." catalogSize={1} action={action} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Not added: More German copies than copies.');
  });

  it('says when nothing matches', () => {
    render(<AddCardSearch query="zzzz" results={[]} owned={new Map()} wished={new Map()} catalogSize={10} action={action} />);
    expect(screen.getByText('No card matches “zzzz”.')).toBeInTheDocument();
  });
});
