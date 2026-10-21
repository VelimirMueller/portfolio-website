import React from 'react';
import { Building2, Edit3, MoreHorizontal, Plus } from 'lucide-react';
import { PIPELINE_STAGE_CONFIG } from '../../_lib/settingsData';
import type { Integration, SettingToggle } from '../../_lib/settings';
import { Badge, Card } from '../ui';
import { SwitchRow } from './SwitchRow';

// The settings tabs after "General". Each one is presentational.

export const NotificationsTab = ({ toggles, onToggle }: { toggles: SettingToggle[]; onToggle: (id: string) => void }) => (
  <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
    <h3 className="text-base font-bold text-white mb-2">Notification Preferences</h3>
    <p className="text-xs text-gray-500 mb-6">Choose which notifications you&apos;d like to receive</p>
    <div className="space-y-5">
      {toggles.map((toggle) => (
        <SwitchRow key={toggle.id} toggle={toggle} onToggle={onToggle} />
      ))}
    </div>
  </Card>
);

export const PipelineStagesTab = () => (
  <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-base font-bold text-white">Pipeline Stage Configuration</h3>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-500 transition-colors">
        <Plus size={12} aria-hidden="true" /> Add Stage
      </button>
    </div>
    <p className="text-xs text-gray-500 mb-6">Define the stages deals move through in your pipeline</p>
    <div className="space-y-3">
      {PIPELINE_STAGE_CONFIG.map((stage, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl glass-demo-inner border animate-fade-in-up" style={{ animationDelay: `${150 + i * 60}ms` }}>
          <div className="flex items-center gap-2 w-6 text-gray-600 cursor-grab">
            <MoreHorizontal size={14} aria-hidden="true" />
          </div>
          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
          <span className="text-xs font-bold text-white flex-1">{stage.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500">Win prob:</span>
            <span className="text-[10px] font-mono text-white bg-[#1a1a1a] px-2 py-0.5 rounded-sm">{stage.probability}%</span>
          </div>
          <button className="text-gray-600 hover:text-white transition-colors p-1" aria-label={`Edit ${stage.name} stage`}>
            <Edit3 size={12} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  </Card>
);

export const BillingTab = () => (
  <>
    <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Current Plan</h3>
        <Badge color="purple">Pro</Badge>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-mono font-bold text-white">$299</span>
        <span className="text-xs text-gray-500">/month</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Billed annually. Renews Mar 15, 2026.</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Team Members', value: '3 / 10' },
          { label: 'Deals', value: 'Unlimited' },
          { label: 'Workflows', value: '10 active' },
          { label: 'Storage', value: '12 GB / 50 GB' },
        ].map((item, i) => (
          <div key={i} className="p-2.5 rounded-lg glass-demo-inner border">
            <div className="text-[10px] text-gray-500 uppercase">{item.label}</div>
            <div className="text-xs font-mono font-bold text-white mt-0.5">{item.value}</div>
          </div>
        ))}
      </div>
      <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors">
        Upgrade to Enterprise
      </button>
    </Card>

    <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-base font-bold text-white mb-4">Payment Method</h3>
      <div className="flex items-center justify-between p-3 rounded-xl glass-demo-inner border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-7 rounded-sm bg-linear-to-r from-blue-600 to-blue-400 flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
          <div>
            <div className="text-xs font-bold text-white font-mono">•••• •••• •••• 4242</div>
            <div className="text-[10px] text-gray-500">Expires 08/27</div>
          </div>
        </div>
        <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold">Change</button>
      </div>
    </Card>
  </>
);

export const TeamTab = () => (
  <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-bold text-white">Team Members</h3>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-500 transition-colors">
        <Plus size={12} aria-hidden="true" /> Invite Member
      </button>
    </div>
    <div className="space-y-3">
      {[
        { name: 'Velimir Müller', role: 'Head of Revenue', initials: 'VM', online: true, email: 'velimir@crmpro.io' },
        { name: 'Sarah Kim', role: 'Account Executive', initials: 'SK', online: true, email: 'sarah@crmpro.io' },
        { name: 'Alex Johnson', role: 'SDR Lead', initials: 'AJ', online: false, email: 'alex@crmpro.io' },
      ].map((member, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl glass-demo-inner border animate-fade-in-up" style={{ animationDelay: `${150 + i * 80}ms` }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[10px] font-bold border border-white/10">{member.initials}</div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${member.online ? 'bg-green-500' : 'bg-gray-600'}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{member.name}</div>
              <div className="text-[10px] text-gray-500">{member.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-12 sm:pl-0">
            <Badge color={i === 0 ? 'purple' : 'blue'}>{member.role}</Badge>
            <span className={`text-[9px] font-mono uppercase ${member.online ? 'text-green-400' : 'text-gray-600'}`}>{member.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export const IntegrationsTab = ({ integrations, onConnect }: { integrations: Integration[]; onConnect: (name: string) => void }) => (
  <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
    <h3 className="text-base font-bold text-white mb-2">Integrations</h3>
    <p className="text-xs text-gray-500 mb-6">Connect your favorite tools to CRMPro</p>
    <div className="space-y-3">
      {integrations.map((int, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl glass-demo-inner border animate-fade-in-up" style={{ animationDelay: `${150 + i * 80}ms` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center border border-[#222] shrink-0">
              <Building2 size={16} className="text-gray-400" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">{int.name}</span>
              <div className="text-[10px] text-gray-500">{int.connected ? 'Syncing data in real-time' : 'Not connected'}</div>
            </div>
          </div>
          <button
            onClick={() => onConnect(int.name)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${int.connected ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
          >
            {int.connected ? 'Connected' : 'Connect'}
          </button>
        </div>
      ))}
    </div>
  </Card>
);
