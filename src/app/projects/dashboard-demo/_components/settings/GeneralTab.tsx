import React from 'react';
import { CheckCircle2, Edit3 } from 'lucide-react';
import type { SettingToggle } from '../../_lib/settings';
import { Card } from '../ui';
import { SwitchRow } from './SwitchRow';

export type Profile = { firstName: string; lastName: string; role: string; email: string };

/** Settings tab "General": the profile form (edit, then save) and the preference switches. */
export const GeneralTab = ({
  profile,
  isEditing,
  saved,
  toggles,
  onEditOrSave,
  onProfileChange,
  onToggle,
}: {
  profile: Profile;
  isEditing: boolean;
  saved: boolean;
  toggles: SettingToggle[];
  onEditOrSave: () => void;
  onProfileChange: (change: Partial<Profile>) => void;
  onToggle: (id: string) => void;
}) => (
  <>
    <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white">Profile Info</h3>
        <button onClick={onEditOrSave} className={`text-xs font-bold transition-colors ${isEditing ? 'text-green-400 hover:text-green-300' : 'text-blue-400 hover:text-blue-300'}`}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border-4 border-[#111] relative flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar-velimir.svg" alt="Avatar" className="w-full h-full rounded-full" />
          <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white border-2 border-[#111]" aria-label="Change profile picture">
            <Edit3 size={12} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-firstname" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">First Name</label>
              <input id="settings-firstname" type="text" value={profile.firstName} onChange={e => onProfileChange({ firstName: e.target.value })} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
            </div>
            <div>
              <label htmlFor="settings-lastname" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
              <input id="settings-lastname" type="text" value={profile.lastName} onChange={e => onProfileChange({ lastName: e.target.value })} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
            </div>
          </div>
          <div>
            <label htmlFor="settings-email" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <input id="settings-email" type="email" value={profile.email} onChange={e => onProfileChange({ email: e.target.value })} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
          </div>
          <div>
            <label htmlFor="settings-role" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Role</label>
            <input id="settings-role" type="text" value={profile.role} onChange={e => onProfileChange({ role: e.target.value })} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
          </div>
        </div>
      </div>
      {saved && (
        <div className="mt-4 flex items-center gap-2 text-xs text-green-400 animate-fade-in-up">
          <CheckCircle2 size={14} aria-hidden="true" /> Changes saved successfully
        </div>
      )}
    </Card>

    <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-base font-bold text-white mb-6">Preferences</h3>
      <div className="space-y-6">
        {toggles.map((toggle) => (
          <SwitchRow key={toggle.id} toggle={toggle} onToggle={onToggle} />
        ))}
      </div>
    </Card>
  </>
);
