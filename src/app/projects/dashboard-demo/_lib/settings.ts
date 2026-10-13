// State updates of the settings view, as pure functions.

export type SettingToggle = { id: string; label: string; desc: string; checked: boolean };
export type Integration = { name: string; connected: boolean };

/** How long "Changes saved successfully" stays visible. */
export const SAVED_MESSAGE_MS = 2000;

/** Flips the switch with this id; the other switches stay as they are. */
export function toggleChecked<T extends SettingToggle>(list: readonly T[], id: string): T[] {
  return list.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t));
}

/** Connects or disconnects the integration with this name. */
export function toggleConnected<T extends Integration>(list: readonly T[], name: string): T[] {
  return list.map((i) => (i.name === name ? { ...i, connected: !i.connected } : i));
}
