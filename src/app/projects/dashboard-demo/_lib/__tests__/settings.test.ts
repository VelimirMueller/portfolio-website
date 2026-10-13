import { INITIAL_INTEGRATIONS, INITIAL_TOGGLES } from '../settingsData';
import { toggleChecked, toggleConnected } from '../settings';

describe('settings updates', () => {
  it('flips only the switch with the given id and keeps the old list', () => {
    const next = toggleChecked(INITIAL_TOGGLES, 'toggle-email');
    expect(next.map((t) => t.checked)).toEqual([true, true, true]);
    expect(INITIAL_TOGGLES.map((t) => t.checked)).toEqual([true, false, true]);
    expect(toggleChecked(next, 'toggle-email')).toEqual(INITIAL_TOGGLES);
  });

  it('connects or disconnects only the named integration', () => {
    const next = toggleConnected(INITIAL_INTEGRATIONS, 'Salesforce');
    expect(next.find((i) => i.name === 'Salesforce')?.connected).toBe(true);
    expect(next.filter((i) => i.connected)).toHaveLength(4);
    expect(toggleConnected(next, 'Slack').find((i) => i.name === 'Slack')?.connected).toBe(false);
  });

  it('ignores an unknown id or name', () => {
    expect(toggleChecked(INITIAL_TOGGLES, 'nope')).toEqual(INITIAL_TOGGLES);
    expect(toggleConnected(INITIAL_INTEGRATIONS, 'Nope')).toEqual(INITIAL_INTEGRATIONS);
  });
});
