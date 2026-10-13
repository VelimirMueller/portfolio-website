import React, { useState } from 'react';
import { INITIAL_INTEGRATIONS, INITIAL_TOGGLES, NOTIFICATION_TOGGLES, SETTINGS_TABS } from '../../_lib/settingsData';
import { SAVED_MESSAGE_MS, toggleChecked, toggleConnected } from '../../_lib/settings';
import { GeneralTab, type Profile } from './GeneralTab';
import { BillingTab, IntegrationsTab, NotificationsTab, PipelineStagesTab, TeamTab } from './tabs';

/** The settings view: tab list on the left, the selected tab on the right. Owns the demo's settings state. */
export const SettingsView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({ firstName: 'Velimir', lastName: 'Müller', role: 'Head of Revenue', email: 'velimir@crmpro.io' });
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);
  const [notifToggles, setNotifToggles] = useState(NOTIFICATION_TOGGLES);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), SAVED_MESSAGE_MS);
  };

  const tabs = [
    <GeneralTab
      key="general"
      profile={profile}
      isEditing={isEditing}
      saved={saved}
      toggles={toggles}
      onEditOrSave={() => (isEditing ? handleSave() : setIsEditing(true))}
      onProfileChange={(change) => setProfile((p) => ({ ...p, ...change }))}
      onToggle={(id) => setToggles((prev) => toggleChecked(prev, id))}
    />,
    <NotificationsTab key="notifications" toggles={notifToggles} onToggle={(id) => setNotifToggles((prev) => toggleChecked(prev, id))} />,
    <PipelineStagesTab key="stages" />,
    <BillingTab key="billing" />,
    <TeamTab key="team" />,
    <IntegrationsTab key="integrations" integrations={integrations} onConnect={(name) => setIntegrations((prev) => toggleConnected(prev, name))} />,
  ];
  const tab = tabs[activeTab] ?? null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
          {SETTINGS_TABS.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors animate-fade-in-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === i ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          {tab}
        </div>
      </div>
    </div>
  );
};
