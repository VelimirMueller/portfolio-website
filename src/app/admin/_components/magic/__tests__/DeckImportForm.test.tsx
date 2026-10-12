import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useFormStatus } from 'react-dom';
import type { ImportDeckState } from '@/app/admin/(dashboard)/magic/actions';
import { DeckImportForm } from '../DeckImportForm';

const mockedStatus = useFormStatus as jest.Mock;

// React 19 warns that useFormState is now useActionState. The component keeps
// useFormState for now; hide only that warning so other errors still show.
const consoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (String(args[0]).includes('ReactDOM.useFormState has been renamed')) return;
    consoleError(...args);
  });
});
afterAll(() => (console.error as jest.Mock).mockRestore());

const fill = () => {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Krenko' } });
  fireEvent.change(screen.getByLabelText('Decklist'), { target: { value: '4 Goblin Guyde' } });
};
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Import deck' }));

describe('DeckImportForm', () => {
  afterEach(() => mockedStatus.mockReturnValue({ pending: false }));

  it('starts without messages and sends the form fields to the action', async () => {
    const action = jest.fn(async (_prev: ImportDeckState, _fd: FormData): Promise<ImportDeckState> => ({ errors: [], unresolved: [] }));
    render(<DeckImportForm action={action} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fill();
    submit();
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const [prev, fd] = action.mock.calls[0];
    expect(prev).toEqual({ errors: [], unresolved: [] });
    expect(fd.get('name')).toBe('Krenko');
    expect(fd.get('list')).toBe('4 Goblin Guyde');
  });

  it('shows the errors the action returns', async () => {
    const action = jest.fn(async (): Promise<ImportDeckState> => ({ errors: ['The main deck is empty.'], unresolved: [] }));
    render(<DeckImportForm action={action} />);
    fill();
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('The main deck is empty.');
  });

  it('lists unresolved names with suggestions and says nothing was created', async () => {
    const action = jest.fn(
      async (): Promise<ImportDeckState> => ({
        errors: [],
        unresolved: [
          { name: 'Goblin Guyde', candidates: ['Goblin Guide', 'Goblin Grenade'] },
          { name: 'Zzz', candidates: [] },
        ],
      })
    );
    render(<DeckImportForm action={action} />);
    fill();
    submit();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('2 names did not match a card');
    expect(alert).toHaveTextContent('Nothing was created.');
    expect(alert).toHaveTextContent('Goblin Guyde — did you mean Goblin Guide, Goblin Grenade?');
    expect(screen.getByText('Zzz').parentElement).not.toHaveTextContent('did you mean');
  });

  it('uses the singular for one unresolved name', async () => {
    const action = jest.fn(async (): Promise<ImportDeckState> => ({ errors: [], unresolved: [{ name: 'Zzz', candidates: [] }] }));
    render(<DeckImportForm action={action} />);
    fill();
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('1 name did not match a card');
  });

  it('blocks a second submit while the import runs', () => {
    mockedStatus.mockReturnValue({ pending: true });
    render(<DeckImportForm action={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Importing…' })).toBeDisabled();
  });
});
