import React from 'react';
import { Activity, CheckCircle2, CircleDot, Mail, Pause, Phone, Play, Plus, Timer, Workflow, Zap } from 'lucide-react';
import { WORKFLOWS } from '../_lib/data';
import { Badge, Card } from './ui';

export const FlowNode = ({ type, label }: { type: string; label: string }) => {
  const iconMap: Record<string, React.ElementType> = { email: Mail, wait: Timer, call: Phone };
  const colorMap: Record<string, string> = {
    email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    wait: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    call: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  const Icon = iconMap[type] || Mail;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${colorMap[type] || colorMap.email}`}>
      <Icon size={12} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};

export const FlowConnector = ({ active }: { active: boolean }) => (
  <div className="flex items-center px-1">
    <div className={`w-6 h-0.5 ${active ? 'bg-blue-500/50' : 'bg-gray-700'}`} />
    <div className={`w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ${active ? 'border-l-[5px] border-l-blue-500/50' : 'border-l-[5px] border-l-gray-700'}`} />
  </div>
);

export const WorkflowsView = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Workflows</h2>
        <p className="text-gray-500 text-sm">Automated sequences and campaigns</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20 self-start sm:self-auto">
        <Plus size={14} aria-hidden="true" /> New Workflow
      </button>
    </div>

    {/* Automation KPIs */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[
        { label: 'Active Campaigns', value: 7, icon: Workflow, color: 'bg-blue-500/10 text-blue-400' },
        { label: 'Emails Sent', value: 12847, icon: Mail, color: 'bg-purple-500/10 text-purple-400' },
        { label: 'Avg Response Rate', value: 24.3, icon: Activity, suffix: '%', color: 'bg-green-500/10 text-green-400' },
      ].map((kpi, i) => (
        <Card key={kpi.label} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
          <div className={`p-3 rounded-xl ${kpi.color}`}>
            <kpi.icon size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-white">{kpi.value.toLocaleString()}{kpi.suffix || ''}</div>
            <div className="text-xs text-gray-500">{kpi.label}</div>
          </div>
        </Card>
      ))}
    </div>

    {/* Workflow Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {WORKFLOWS.map((wf, i) => (
        <Card
          key={wf.name}
          className={`animate-scale-in ${wf.status === 'active' ? 'animate-pulse-glow' : ''}`}
          style={{ animationDelay: `${300 + i * 120}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white">{wf.name}</h3>
                <Badge color={wf.status === 'active' ? 'green' : 'orange'}>{wf.status}</Badge>
              </div>
              <p className="text-[10px] text-gray-500">{wf.description}</p>
            </div>
            <button className={`p-2 rounded-lg border transition-colors ${wf.status === 'active' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-[#333] text-gray-500 hover:text-white'}`} aria-label={wf.status === 'active' ? 'Pause workflow' : 'Start workflow'}>
              {wf.status === 'active' ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            </button>
          </div>

          {/* Flow diagram */}
          <div className="flex items-center gap-0 overflow-x-auto py-3 mb-4">
            {wf.steps.map((step, si) => (
              <React.Fragment key={si}>
                <FlowNode type={step.type} label={step.label} />
                {si < wf.steps.length - 1 && <FlowConnector active={wf.status === 'active'} />}
              </React.Fragment>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-3 border-t border-[#222] text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <CircleDot size={10} className="text-blue-400" aria-hidden="true" />
              <span className="text-gray-400">{wf.enrolled} enrolled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={10} className="text-green-400" aria-hidden="true" />
              <span className="text-gray-400">{wf.completed} completed</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Zap size={10} className="text-yellow-400" aria-hidden="true" />
              <span className="text-white font-bold">{wf.conversion}% conversion</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
