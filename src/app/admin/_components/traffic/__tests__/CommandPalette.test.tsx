import { fireEvent, render, screen } from '@testing-library/react';
import { CommandPalette, type PaletteAction } from '../CommandPalette';

const action = (id: string, group: string, label: string): PaletteAction => ({ id, group, label, run: jest.fn() });
const actions = [
  action('r7', 'Range', 'Last 7 days'),
  action('r30', 'Range', 'Last 30 days'),
  action('m-v', 'Metric', 'Chart visitors'),
  action('s-top', 'Section', 'Jump to top pages'),
];

const input = () => screen.getByRole('combobox');
const selected = () => screen.getByRole('option', { selected: true });

describe('CommandPalette', () => {
  it('renders nothing while closed', () => {
    render(<CommandPalette open={false} onClose={jest.fn()} actions={actions} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows one header above the first action of each group', () => {
    render(<CommandPalette open onClose={jest.fn()} actions={actions} />);
    expect(screen.getAllByText('Range')).toHaveLength(1);
    expect(screen.getAllByText('Metric')).toHaveLength(1);
    expect(screen.getAllByText('Section')).toHaveLength(1);
  });

  it('selects the first result again whenever the query changes', () => {
    render(<CommandPalette open onClose={jest.fn()} actions={actions} />);
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(selected()).toHaveTextContent('Last 30 days');

    fireEvent.change(input(), { target: { value: 'last' } });
    expect(selected()).toHaveTextContent('Last 7 days');
  });

  it('starts every opening with an empty query and the first result', () => {
    const onClose = jest.fn();
    const { rerender } = render(<CommandPalette open onClose={onClose} actions={actions} />);
    fireEvent.change(input(), { target: { value: 'days' } });
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(selected()).toHaveTextContent('Last 30 days');

    rerender(<CommandPalette open={false} onClose={onClose} actions={actions} />);
    rerender(<CommandPalette open onClose={onClose} actions={actions} />);

    expect(input()).toHaveValue('');
    expect(selected()).toHaveTextContent('Last 7 days');
    expect(screen.getAllByRole('option')).toHaveLength(actions.length);
  });

  it('runs the selected action on Enter and closes', () => {
    const onClose = jest.fn();
    render(<CommandPalette open onClose={onClose} actions={actions} />);
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(actions[1].run).toHaveBeenCalledTimes(1);
  });
});
