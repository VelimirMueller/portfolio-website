import { act, fireEvent, render, screen } from '@testing-library/react';
import { SettingsView } from '../SettingsView';

describe('settings view', () => {
  afterEach(() => jest.useRealTimers());

  const tab = (name: string) => fireEvent.click(screen.getByRole('button', { name }));

  it('edits the profile only after Edit and shows the saved message for two seconds', () => {
    jest.useFakeTimers();
    render(<SettingsView />);
    const firstName = screen.getByLabelText('First Name');
    expect(firstName).toHaveAttribute('readonly');

    tab('Edit');
    expect(firstName).not.toHaveAttribute('readonly');
    fireEvent.change(firstName, { target: { value: 'Vel' } });
    tab('Save');
    expect(firstName).toHaveValue('Vel');
    expect(firstName).toHaveAttribute('readonly');
    expect(screen.getByText('Changes saved successfully')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(2000));
    expect(screen.queryByText('Changes saved successfully')).not.toBeInTheDocument();
  });

  it('keeps the saved message two seconds after the last save', () => {
    jest.useFakeTimers();
    render(<SettingsView />);
    tab('Edit');
    tab('Save');
    act(() => jest.advanceTimersByTime(1500));
    tab('Edit');
    tab('Save');
    act(() => jest.advanceTimersByTime(1500));
    expect(screen.getByText('Changes saved successfully')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(500));
    expect(screen.queryByText('Changes saved successfully')).not.toBeInTheDocument();
  });

  it('flips a preference switch', () => {
    render(<SettingsView />);
    const email = screen.getByRole('switch', { name: 'Email Notifications' });
    expect(email).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(email);
    expect(email).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps the switch states when the tab changes and comes back', () => {
    render(<SettingsView />);
    tab('Notifications');
    const reports = screen.getByRole('switch', { name: 'Weekly Reports' });
    fireEvent.click(reports);
    tab('Team');
    expect(screen.getByText('Sarah Kim')).toBeInTheDocument();
    tab('Notifications');
    expect(screen.getByRole('switch', { name: 'Weekly Reports' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows each tab', () => {
    render(<SettingsView />);
    tab('Pipeline Stages');
    expect(screen.getByText('Pipeline Stage Configuration')).toBeInTheDocument();
    tab('Billing & Plans');
    expect(screen.getByText('Upgrade to Enterprise')).toBeInTheDocument();
    tab('General');
    expect(screen.getByText('Profile Info')).toBeInTheDocument();
  });

  it('connects and disconnects an integration', () => {
    render(<SettingsView />);
    tab('Integrations');
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
    expect(screen.queryByRole('button', { name: 'Connect' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Connected' })).toHaveLength(4);
    fireEvent.click(screen.getAllByRole('button', { name: 'Connected' })[0]);
    expect(screen.getByText('Not connected')).toBeInTheDocument();
  });
});
