import React from 'react';
import type { SettingToggle } from '../../_lib/settings';

/** One labelled on/off switch of the settings view. */
export const SwitchRow = ({ toggle, onToggle }: { toggle: SettingToggle; onToggle: (id: string) => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm font-bold text-white" id={toggle.id}>{toggle.label}</div>
      <div className="text-xs text-gray-500">{toggle.desc}</div>
    </div>
    <button
      role="switch"
      aria-checked={toggle.checked}
      aria-labelledby={toggle.id}
      onClick={() => onToggle(toggle.id)}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${toggle.checked ? 'bg-blue-600' : 'bg-[#222] border border-[#333]'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full shadow-xs transition-all ${toggle.checked ? 'right-1 bg-white' : 'left-1 bg-gray-500'}`} />
    </button>
  </div>
);
