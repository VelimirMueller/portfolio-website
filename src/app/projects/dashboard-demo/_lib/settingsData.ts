// Initial values of the settings view.

export const SETTINGS_TABS = ['General', 'Notifications', 'Pipeline Stages', 'Billing & Plans', 'Team', 'Integrations'] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const INITIAL_INTEGRATIONS = [
  { name: 'Slack', connected: true },
  { name: 'HubSpot', connected: true },
  { name: 'Salesforce', connected: false },
  { name: 'Stripe', connected: true },
];

export const INITIAL_TOGGLES = [
  { id: 'toggle-darkmode', label: 'Dark Mode', desc: 'System default is active', checked: true },
  { id: 'toggle-email', label: 'Email Notifications', desc: 'Receive weekly digests', checked: false },
  { id: 'toggle-public', label: 'Public Profile', desc: 'Visible to search engines', checked: true },
];

export const NOTIFICATION_TOGGLES = [
  { id: 'notif-deals', label: 'Deal Updates', desc: 'When a deal changes stage or value', checked: true },
  { id: 'notif-assignments', label: 'Lead Assignments', desc: 'When a new lead is assigned to you', checked: true },
  { id: 'notif-meetings', label: 'Meeting Reminders', desc: '15 minutes before scheduled meetings', checked: true },
  { id: 'notif-reports', label: 'Weekly Reports', desc: 'Pipeline and revenue summary every Monday', checked: false },
  { id: 'notif-workflows', label: 'Workflow Alerts', desc: 'When automation sequences complete', checked: false },
];

export const PIPELINE_STAGE_CONFIG = [
  { name: 'New Lead', color: 'bg-blue-500', probability: 10 },
  { name: 'Qualified', color: 'bg-cyan-500', probability: 25 },
  { name: 'Demo Scheduled', color: 'bg-purple-500', probability: 40 },
  { name: 'Proposal Sent', color: 'bg-orange-500', probability: 60 },
  { name: 'Negotiation', color: 'bg-pink-500', probability: 80 },
  { name: 'Closed Won', color: 'bg-green-500', probability: 100 },
];
