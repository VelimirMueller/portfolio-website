import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ContactMessage } from '../../_lib/messages';

const push = jest.fn();
const replace = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, replace, refresh }) }));
const updateStatuses = jest.fn(async () => undefined);
const deleteMessages = jest.fn(async () => undefined);
jest.mock('../../actions', () => ({
  updateStatuses: (...a: unknown[]) => updateStatuses(...(a as [])),
  deleteMessages: (...a: unknown[]) => deleteMessages(...(a as [])),
}));

import { InboxWorkspace, type InboxWorkspaceProps } from '../InboxWorkspace';

const id = (n: number) => `${n}${n}${n}${n}${n}${n}${n}${n}-0000-4000-8000-000000000000`;
const msg = (n: number, over: Partial<ContactMessage> = {}): ContactMessage => ({
  id: id(n),
  name: `Person ${n}`,
  email: `p${n}@example.com`,
  message: `Message ${n}`,
  status: 'new',
  created_at: '2026-10-01T10:00:00Z',
  ...over,
});
const messages = [msg(1), msg(2), msg(3)];
const counts = { new: 3, read: 0, archived: 0, spam: 0, all: 3 };

const setup = (over: Partial<InboxWorkspaceProps> = {}) =>
  render(
    <InboxWorkspace messages={messages} counts={counts} filter="new" query="" selectedId={null} error={false} {...over} />
  );
const key = (k: string) => fireEvent.keyDown(window, { key: k });
const flush = () => act(async () => {});

beforeEach(() => jest.clearAllMocks());

describe('InboxWorkspace', () => {
  it('shows an empty reading pane until a message is opened', () => {
    setup();
    expect(screen.getByText('Select a message')).toBeInTheDocument();
  });

  it('opens the first message with j and steps with j/k', () => {
    const { rerender } = setup();
    key('j');
    expect(push).toHaveBeenLastCalledWith(`/admin?id=${id(1)}`, { scroll: false });
    rerender(<InboxWorkspace messages={messages} counts={counts} filter="new" query="" selectedId={id(1)} error={false} />);
    key('j');
    expect(push).toHaveBeenLastCalledWith(`/admin?id=${id(2)}`, { scroll: false });
    key('k');
    expect(push).toHaveBeenLastCalledWith(`/admin?id=${id(1)}`, { scroll: false });
  });

  it('keeps filter and search in the URL it opens', () => {
    setup({ filter: 'all', query: 'acme' });
    key('j');
    expect(push).toHaveBeenLastCalledWith(`/admin?status=all&q=acme&id=${id(1)}`, { scroll: false });
  });

  it('archives the open message with e and advances to the next one', async () => {
    setup({ selectedId: id(2) });
    key('e');
    await flush();
    expect(updateStatuses).toHaveBeenCalledWith([id(2)], 'archived');
    expect(replace).toHaveBeenCalledWith(`/admin?id=${id(3)}`, { scroll: false });
    expect(refresh).toHaveBeenCalled();
  });

  it('marks spam with s, and goes back up when the last message leaves', async () => {
    setup({ selectedId: id(3) });
    key('s');
    await flush();
    expect(updateStatuses).toHaveBeenCalledWith([id(3)], 'spam');
    expect(replace).toHaveBeenCalledWith(`/admin?id=${id(2)}`, { scroll: false });
  });

  it('toggles unread with u without leaving the "all" view', async () => {
    setup({ filter: 'all', selectedId: id(1), messages: [msg(1, { status: 'read' })], counts: { ...counts, all: 1 } });
    key('u');
    await flush();
    expect(updateStatuses).toHaveBeenCalledWith([id(1)], 'new');
    expect(replace).not.toHaveBeenCalled();
  });

  it('ignores shortcuts while typing in the search field', () => {
    setup({ selectedId: id(1) });
    fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Search messages' }), { key: 'e' });
    expect(updateStatuses).not.toHaveBeenCalled();
  });

  it('closes the open message with Escape', () => {
    setup({ selectedId: id(1) });
    key('Escape');
    expect(push).toHaveBeenLastCalledWith('/admin', { scroll: false });
  });

  it('acts on a selection from the bulk bar', async () => {
    setup();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select message from Person 1' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select message from Person 3' }));
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(within(bar).getByText('2 selected')).toBeInTheDocument();
    fireEvent.click(within(bar).getByRole('button', { name: 'Archive' }));
    await flush();
    expect(updateStatuses).toHaveBeenCalledWith([id(1), id(3)], 'archived');
  });

  it('selects everything and clears again', () => {
    setup();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all' }));
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    key('Escape');
    expect(screen.queryByText('3 selected')).not.toBeInTheDocument();
  });

  it('asks before deleting and deletes only on confirm', async () => {
    setup({ selectedId: id(1) });
    const pane = screen.getByRole('toolbar', { name: 'Message actions' });
    fireEvent.click(within(pane).getByRole('button', { name: 'Delete' }));
    expect(deleteMessages).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
    await flush();
    expect(deleteMessages).toHaveBeenCalledWith([id(1)]);
    expect(replace).toHaveBeenCalledWith(`/admin?id=${id(2)}`, { scroll: false });
  });

  it('cancels a delete', () => {
    setup({ selectedId: id(1) });
    fireEvent.click(within(screen.getByRole('toolbar', { name: 'Message actions' })).getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows an error when an action fails and stays put', async () => {
    updateStatuses.mockRejectedValueOnce(new Error('nope'));
    setup({ selectedId: id(1) });
    key('e');
    await flush();
    expect(screen.getByRole('alert')).toHaveTextContent('Could not update.');
    expect(replace).not.toHaveBeenCalled();
  });

  it('uses row quick actions without opening the message', async () => {
    setup();
    const row = screen.getByText('Person 2').closest('li')!;
    fireEvent.click(within(row).getByRole('button', { name: 'Mark as spam' }));
    await flush();
    expect(updateStatuses).toHaveBeenCalledWith([id(2)], 'spam');
    expect(push).not.toHaveBeenCalled();
  });

  it('says all caught up when a tab is empty, and no matches for a search', () => {
    const { rerender } = setup({ messages: [] });
    expect(screen.getByText('All caught up')).toBeInTheDocument();
    rerender(<InboxWorkspace messages={[]} counts={counts} filter="new" query="zzz" selectedId={null} error={false} />);
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('steps with the pane arrows and offers reply', () => {
    setup({ selectedId: id(2) });
    const pane = screen.getByRole('toolbar', { name: 'Message actions' });
    expect(within(pane).getByText('2 / 3')).toBeInTheDocument();
    fireEvent.click(within(pane).getByRole('button', { name: 'Next message' }));
    expect(push).toHaveBeenLastCalledWith(`/admin?id=${id(3)}`, { scroll: false });
    expect(screen.getByRole('link', { name: /Reply/ }).getAttribute('href')).toMatch(/^mailto:p2@example\.com\?subject=Re/);
  });
});

describe('InboxWorkspace delete confirmation placement', () => {
  it('asks once, in the list, for a bulk delete', async () => {
    setup({ selectedId: id(1) });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select message from Person 2' }));
    fireEvent.click(within(screen.getByRole('toolbar', { name: 'Bulk actions' })).getByRole('button', { name: 'Delete' }));
    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
    expect(within(screen.getByRole('region', { name: 'Messages' })).getByRole('alertdialog')).toHaveTextContent('Delete this message');
  });
});
