'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  KanbanSquare,
  GanttChart,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  Check,
  Zap,
  Clock,
  Target,
  Activity,
  Calendar,
  Flag,
  AlertCircle,
  Lightbulb,
  Cog,
  Timer,
  CircleDot,
  Flame,
  Milestone,
  Layers,
  UserCheck,
  MessageSquare,
  Paperclip,
} from 'lucide-react';

// ============================================================
// DATA CONSTANTS
// ============================================================

const PROJECT_PHASES = [
  { name: 'Research', icon: Search, color: 'from-blue-500 to-blue-600', accent: 'blue', progress: 100, tasks: 12, completed: 12 },
  { name: 'Ideation', icon: Lightbulb, color: 'from-amber-500 to-amber-600', accent: 'amber', progress: 100, tasks: 8, completed: 8 },
  { name: 'Process', icon: Cog, color: 'from-purple-500 to-purple-600', accent: 'purple', progress: 72, tasks: 18, completed: 13 },
  { name: 'Execution', icon: Timer, color: 'from-cyan-500 to-cyan-600', accent: 'cyan', progress: 35, tasks: 24, completed: 8 },
  { name: 'Launch', icon: Target, color: 'from-green-500 to-green-600', accent: 'green', progress: 0, tasks: 10, completed: 0 },
];

const OVERVIEW_KPIS = [
  { label: 'Sprint Velocity', value: 42, suffix: 'pts', trend: +8.3, icon: Zap, color: 'blue' },
  { label: 'Completion Rate', value: 73, suffix: '%', trend: +5.1, icon: CheckCircle2, color: 'green' },
  { label: 'Burn Rate', value: 68, suffix: '%', trend: -2.4, icon: Flame, color: 'amber' },
  { label: 'Days to Launch', value: 34, suffix: 'd', trend: 0, icon: Calendar, color: 'purple' },
];

const MILESTONES = [
  { name: 'User Research Complete', date: 'Jan 10', phase: 'Research', done: true },
  { name: 'Design System v1.0', date: 'Jan 24', phase: 'Ideation', done: true },
  { name: 'Core Features MVP', date: 'Feb 14', phase: 'Process', done: true },
  { name: 'Beta Testing', date: 'Feb 28', phase: 'Process', done: false },
  { name: 'Performance Audit', date: 'Mar 10', phase: 'Execution', done: false },
  { name: 'Go-Live', date: 'Mar 21', phase: 'Launch', done: false },
];

const BOARD_COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: 'gray',
    tasks: [
      { id: 1, title: 'Define API rate limiting strategy', priority: 'medium', assignee: 'AJ', tags: ['Backend'], comments: 2, attachments: 0 },
      { id: 2, title: 'Create onboarding flow wireframes', priority: 'high', assignee: 'SK', tags: ['Design'], comments: 5, attachments: 3 },
      { id: 3, title: 'Evaluate analytics providers', priority: 'low', assignee: 'VM', tags: ['Research'], comments: 1, attachments: 0 },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    color: 'blue',
    tasks: [
      { id: 4, title: 'Implement SSO with SAML', priority: 'high', assignee: 'VM', tags: ['Auth', 'Security'], comments: 8, attachments: 2 },
      { id: 5, title: 'Design notification center', priority: 'medium', assignee: 'SK', tags: ['Design', 'UX'], comments: 3, attachments: 1 },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'purple',
    tasks: [
      { id: 6, title: 'Build real-time collaboration engine', priority: 'critical', assignee: 'VM', tags: ['Core', 'WebSocket'], comments: 12, attachments: 4 },
      { id: 7, title: 'Dashboard analytics widgets', priority: 'high', assignee: 'AJ', tags: ['Frontend', 'Charts'], comments: 6, attachments: 2 },
      { id: 8, title: 'Permission system refactor', priority: 'medium', assignee: 'LP', tags: ['Backend'], comments: 4, attachments: 1 },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    color: 'amber',
    tasks: [
      { id: 9, title: 'Workspace settings UI', priority: 'medium', assignee: 'SK', tags: ['Frontend'], comments: 7, attachments: 3 },
      { id: 10, title: 'Email template engine', priority: 'low', assignee: 'AJ', tags: ['Backend'], comments: 2, attachments: 1 },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: 'green',
    tasks: [
      { id: 11, title: 'Project timeline view', priority: 'high', assignee: 'VM', tags: ['Frontend', 'UX'], comments: 9, attachments: 5 },
      { id: 12, title: 'User invitation flow', priority: 'medium', assignee: 'LP', tags: ['Auth'], comments: 4, attachments: 2 },
    ],
  },
];

const TIMELINE_ITEMS = [
  { name: 'User Research & Discovery', phase: 'Research', start: 0, duration: 3, color: 'bg-blue-500', done: true },
  { name: 'Competitive Analysis', phase: 'Research', start: 1, duration: 2, color: 'bg-blue-400', done: true },
  { name: 'Design System Foundation', phase: 'Ideation', start: 3, duration: 3, color: 'bg-amber-500', done: true },
  { name: 'Wireframes & Prototyping', phase: 'Ideation', start: 4, duration: 2, color: 'bg-amber-400', done: true },
  { name: 'Core Architecture', phase: 'Process', start: 6, duration: 3, color: 'bg-purple-500', done: true },
  { name: 'Feature Development', phase: 'Process', start: 7, duration: 4, color: 'bg-purple-400', done: false },
  { name: 'Integration Testing', phase: 'Execution', start: 9, duration: 2, color: 'bg-cyan-500', done: false },
  { name: 'Performance Optimization', phase: 'Execution', start: 10, duration: 2, color: 'bg-cyan-400', done: false },
  { name: 'Staging & QA', phase: 'Launch', start: 11, duration: 2, color: 'bg-green-500', done: false },
  { name: 'Production Deploy', phase: 'Launch', start: 12, duration: 1, color: 'bg-green-400', done: false },
];

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13'];

const TEAM_MEMBERS = [
  { name: 'Velimir M.', role: 'Tech Lead', initials: 'VM', online: true, capacity: 85, tasksActive: 3, tasksDone: 14, avatar: 'bg-gradient-to-br from-blue-600 to-purple-600' },
  { name: 'Sarah K.', role: 'Product Designer', initials: 'SK', online: true, capacity: 72, tasksActive: 2, tasksDone: 11, avatar: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  { name: 'Alex J.', role: 'Frontend Engineer', initials: 'AJ', online: false, capacity: 91, tasksActive: 2, tasksDone: 9, avatar: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
  { name: 'Lena P.', role: 'Backend Engineer', initials: 'LP', online: true, capacity: 64, tasksActive: 2, tasksDone: 7, avatar: 'bg-gradient-to-br from-amber-500 to-orange-600' },
];

const RECENT_ACTIVITY = [
  { user: 'VM', action: 'moved', detail: '"Build collaboration engine" to In Progress', time: '5m ago' },
  { user: 'SK', action: 'completed', detail: '"Design notification center" review', time: '22m ago' },
  { user: 'AJ', action: 'commented on', detail: '"Dashboard analytics widgets"', time: '1h ago' },
  { user: 'LP', action: 'created', detail: '"Permission system refactor"', time: '2h ago' },
  { user: 'VM', action: 'merged', detail: 'PR #142 — Timeline view', time: '3h ago' },
];

const PLANNER_NOTIFICATIONS = [
  { text: 'Sprint 4 review meeting starts in 15 min', time: '15m', icon: Calendar, color: 'text-blue-400', read: false },
  { text: 'Sarah K. completed "Design notification center"', time: '22m ago', icon: CheckCircle2, color: 'text-green-400', read: false },
  { text: '"Permission system refactor" assigned to you', time: '1h ago', icon: UserCheck, color: 'text-purple-400', read: false },
  { text: 'PR #142 merged — Timeline view', time: '3h ago', icon: Zap, color: 'text-amber-400', read: true },
  { text: 'New comment on "Dashboard analytics widgets"', time: '4h ago', icon: MessageSquare, color: 'text-cyan-400', read: true },
  { text: 'Milestone reached: Phase 2 complete', time: '1d ago', icon: Target, color: 'text-emerald-400', read: true },
];

const PlannerNotificationDropdown = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  const unreadCount = PLANNER_NOTIFICATIONS.filter(n => !n.read).length;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 w-80 bg-[#111] border border-[#222] rounded-2xl shadow-2xl shadow-black/50 z-50 animate-fade-in-up overflow-hidden">
        <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500 text-white rounded-full">{unreadCount}</span>
            )}
          </div>
          <button className="text-[10px] text-blue-400 hover:text-blue-300 font-mono">Mark all read</button>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-[#1a1a1a]">
          {PLANNER_NOTIFICATIONS.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className={`px-4 py-3 flex items-start gap-3 hover:bg-[#1a1a1a] transition-colors cursor-pointer ${!n.read ? 'bg-blue-500/5' : ''}`}>
                <div className={`mt-0.5 ${n.color}`}><Icon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.text}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{n.time}</p>
                </div>
                {!n.read && <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
              </div>
            );
          })}
        </div>
        <div className="px-4 py-2.5 border-t border-[#222] text-center">
          <button className="text-[10px] text-blue-400 hover:text-blue-300 font-mono">View all notifications</button>
        </div>
      </div>
    </>
  );
};

// ============================================================
// HOOKS
// ============================================================

function useCountUp(end: number, duration = 1500): number {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>();

  useEffect(() => {
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setCurrent(Math.round(ease(progress) * end));
      if (progress < 1) rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [end, duration]);

  return current;
}

// ============================================================
// SHARED UI
// ============================================================

const Card = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`bg-[#111111] rounded-2xl p-5 border border-[#222] hover:border-[#333] transition-colors ${className}`} style={style}>
    {children}
  </div>
);

const NavItem = ({ icon: Icon, label, id, activeId, onClick }: { icon: React.ElementType; label: string; id: string; activeId: string; onClick: (id: string) => void }) => (
  <button
    onClick={() => onClick(id)}
    aria-current={activeId === id ? 'page' : undefined}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeId === id ? 'bg-blue-600/10 text-blue-400' : 'text-gray-500 hover:bg-[#1a1a1a] hover:text-white'}`}
  >
    <Icon size={20} aria-hidden="true" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) => {
  const styles: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase tracking-wide ${styles[color] || styles.blue}`}>
      {children}
    </span>
  );
};

const AnimatedBar = ({ width, color = 'bg-blue-500', delay = 0 }: { width: number; color?: string; delay?: number }) => (
  <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full animate-fill-bar`}
      style={{ '--bar-width': `${width}%`, animationDelay: `${delay}ms` } as React.CSSProperties}
    />
  </div>
);

// ============================================================
// PHASE PROGRESS (inspired by design image flow)
// ============================================================

const PhaseProgress = () => (
  <Card className="animate-fade-in-up overflow-hidden" style={{ animationDelay: '100ms' }}>
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-sm font-bold text-white">Project Phases</h3>
      <span className="text-[10px] font-mono text-gray-500">Sprint 8 of 13</span>
    </div>

    {/* Phase flow — horizontal connected cards inspired by the design image */}
    <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
      {PROJECT_PHASES.map((phase, i) => {
        const Icon = phase.icon;
        const isComplete = phase.progress === 100;
        const isActive = phase.progress > 0 && phase.progress < 100;
        const colorMap: Record<string, string> = {
          blue: 'border-blue-500/40 bg-blue-500/5',
          amber: 'border-amber-500/40 bg-amber-500/5',
          purple: 'border-purple-500/40 bg-purple-500/5',
          cyan: 'border-cyan-500/40 bg-cyan-500/5',
          green: 'border-green-500/40 bg-green-500/5',
        };
        const iconBgMap: Record<string, string> = {
          blue: 'bg-blue-500/20 text-blue-400',
          amber: 'bg-amber-500/20 text-amber-400',
          purple: 'bg-purple-500/20 text-purple-400',
          cyan: 'bg-cyan-500/20 text-cyan-400',
          green: 'bg-green-500/20 text-green-400',
        };
        const barColorMap: Record<string, string> = {
          blue: 'bg-blue-500', amber: 'bg-amber-500', purple: 'bg-purple-500', cyan: 'bg-cyan-500', green: 'bg-green-500',
        };

        return (
          <React.Fragment key={phase.name}>
            <div
              className={`flex-1 min-w-[140px] p-4 rounded-xl border transition-all animate-fade-in-up ${isActive ? `${colorMap[phase.accent]} animate-pulse-glow` : isComplete ? 'border-[#333] bg-[#0a0a0a]' : 'border-[#1a1a1a] bg-[#0a0a0a]'}`}
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isComplete ? 'bg-green-500/20 text-green-400' : iconBgMap[phase.accent]}`}>
                  {isComplete ? <Check size={14} aria-hidden="true" /> : <Icon size={14} aria-hidden="true" />}
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="text-xs font-bold text-white mb-1">{phase.name}</div>
              <div className="text-[10px] text-gray-500 mb-3">{phase.completed}/{phase.tasks} tasks</div>
              <AnimatedBar width={phase.progress} color={barColorMap[phase.accent]} delay={300 + i * 100} />
              <div className="text-[9px] font-mono text-gray-600 mt-1.5 text-right">{phase.progress}%</div>
            </div>
            {i < PROJECT_PHASES.length - 1 && (
              <div className="flex items-center px-1 flex-shrink-0">
                <ChevronRight size={16} className={isComplete ? 'text-green-500/50' : 'text-[#333]'} aria-hidden="true" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  </Card>
);

// ============================================================
// SUB-VIEWS
// ============================================================

const OverviewView = () => {
  const totalTasks = PROJECT_PHASES.reduce((s, p) => s + p.tasks, 0);
  const completedTasks = PROJECT_PHASES.reduce((s, p) => s + p.completed, 0);
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {OVERVIEW_KPIS.map((kpi, i) => {
          const colorMap: Record<string, string> = {
            blue: 'bg-blue-500/10 text-blue-400',
            green: 'bg-green-500/10 text-green-400',
            amber: 'bg-amber-500/10 text-amber-400',
            purple: 'bg-purple-500/10 text-purple-400',
          };
          return (
            <Card key={kpi.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorMap[kpi.color]}`}>
                  <kpi.icon size={16} aria-hidden="true" />
                </div>
                {kpi.trend !== 0 && (
                  <span className={`text-[10px] font-mono ${kpi.trend > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                    {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                  </span>
                )}
              </div>
              <div className="text-xl font-mono font-bold text-white">{kpi.value}{kpi.suffix}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Phase Progress */}
      <PhaseProgress />

      {/* Milestones + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Milestones</h3>
            <span className="text-[10px] font-mono text-gray-500">{MILESTONES.filter(m => m.done).length}/{MILESTONES.length} completed</span>
          </div>
          <div className="space-y-2">
            {MILESTONES.map((ms, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${ms.done ? 'border-[#1a1a1a] bg-[#0a0a0a]' : 'border-[#222] hover:border-[#333]'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ms.done ? 'bg-green-500/20 text-green-400' : 'border border-[#333]'}`}>
                  {ms.done && <Check size={10} aria-hidden="true" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${ms.done ? 'text-gray-500 line-through' : 'text-white'}`}>{ms.name}</div>
                </div>
                <Badge color={ms.done ? 'green' : 'gray'}>{ms.phase}</Badge>
                <span className="text-[10px] font-mono text-gray-600 whitespace-nowrap">{ms.date}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Recent Activity</h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-green-400 uppercase">Live</span>
            </span>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${i === 0 ? 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent bg-[length:200%_100%] animate-shimmer' : 'hover:bg-[#1a1a1a]'}`}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[8px] font-bold border border-white/10 flex-shrink-0 mt-0.5">{a.user}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-300">
                    <span className="font-bold text-white">{a.user}</span>{' '}
                    <span className="text-gray-500">{a.action}</span>{' '}
                    <span>{a.detail}</span>
                  </div>
                  <span className="text-[9px] text-gray-600 font-mono">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Overall Progress + Team Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <h3 className="text-sm font-bold text-white mb-4">Overall Progress</h3>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" role="img" aria-label={`Project ${overallProgress}% complete`}>
              <path className="text-[#222]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              <path className="text-blue-500" strokeDasharray={`${overallProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono font-bold text-white">{overallProgress}%</span>
              <span className="text-[9px] text-gray-500 uppercase">Complete</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">{completedTasks} of {totalTasks} tasks done</div>
          </div>
        </Card>

        <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <h3 className="text-sm font-bold text-white mb-4">Team Workload</h3>
          <div className="space-y-3">
            {TEAM_MEMBERS.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full ${m.avatar} flex items-center justify-center text-[9px] font-bold text-white border border-white/10`}>{m.initials}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#111] ${m.online ? 'bg-green-500' : 'bg-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-white">{m.name}</span>
                    <span className="text-[9px] font-mono text-gray-500">{m.capacity}%</span>
                  </div>
                  <AnimatedBar width={m.capacity} color={m.capacity > 85 ? 'bg-red-500' : m.capacity > 70 ? 'bg-amber-500' : 'bg-blue-500'} delay={800 + i * 100} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const BoardView = () => {
  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-gray-500',
  };
  const columnColors: Record<string, string> = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Board</h2>
          <p className="text-gray-500 text-xs">Sprint 8 — Feb 10 - Feb 24</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20">
          <Plus size={14} aria-hidden="true" /> New Task
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((col, ci) => (
          <div key={col.id} className="min-w-[260px] w-[260px] flex-shrink-0 animate-fade-in-up" style={{ animationDelay: `${ci * 80}ms` }}>
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${columnColors[col.color]}`} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</span>
                <span className="text-[10px] font-mono text-gray-600 bg-[#1a1a1a] px-1.5 py-0.5 rounded">{col.tasks.length}</span>
              </div>
              <button className="text-gray-600 hover:text-white transition-colors" aria-label={`More options for ${col.title}`}>
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>

            {/* Task cards */}
            <div className="space-y-2">
              {col.tasks.map((task, ti) => (
                <div
                  key={task.id}
                  className="bg-[#111] rounded-xl p-4 border border-[#222] hover:border-[#333] transition-all cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${ci * 80 + ti * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority]}`} />
                      <span className="text-[9px] font-mono text-gray-500 uppercase">{task.priority}</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-600">#{task.id}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-relaxed">{task.title}</h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 bg-[#1a1a1a] text-gray-400 rounded border border-[#222]">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[8px] font-bold border border-white/10">{task.assignee}</div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {task.comments > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px]">
                          <MessageSquare size={10} aria-hidden="true" /> {task.comments}
                        </span>
                      )}
                      {task.attachments > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px]">
                          <Paperclip size={10} aria-hidden="true" /> {task.attachments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelineView = () => {
  const totalWeeks = WEEKS.length;
  const currentWeek = 8;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Timeline</h2>
          <p className="text-gray-500 text-xs">Project Gantt — Q1 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="blue">Current: Week {currentWeek}</Badge>
        </div>
      </div>

      <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Week headers */}
            <div className="flex border-b border-[#222]">
              <div className="w-48 flex-shrink-0 px-4 py-3 text-[10px] font-mono text-gray-500 uppercase bg-[#0a0a0a]">Task</div>
              <div className="flex-1 flex">
                {WEEKS.map((w, i) => (
                  <div
                    key={w}
                    className={`flex-1 px-1 py-3 text-center text-[9px] font-mono border-l border-[#1a1a1a] ${i + 1 === currentWeek ? 'bg-blue-500/5 text-blue-400 font-bold' : 'text-gray-600'}`}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline rows */}
            {TIMELINE_ITEMS.map((item, i) => (
              <div key={i} className="flex border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-colors animate-fade-in-up" style={{ animationDelay: `${200 + i * 50}ms` }}>
                <div className="w-48 flex-shrink-0 px-4 py-3 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.done ? 'bg-green-500' : item.color}`} />
                  <span className={`text-[11px] ${item.done ? 'text-gray-500' : 'text-white'} truncate`}>{item.name}</span>
                </div>
                <div className="flex-1 flex relative">
                  {WEEKS.map((_, wi) => (
                    <div key={wi} className={`flex-1 border-l border-[#1a1a1a] ${wi + 1 === currentWeek ? 'bg-blue-500/5' : ''}`} />
                  ))}
                  {/* Gantt bar */}
                  <div
                    className={`absolute top-2 bottom-2 rounded-md ${item.done ? 'opacity-50' : ''} ${item.color} animate-fill-bar`}
                    style={{
                      left: `${(item.start / totalWeeks) * 100}%`,
                      '--bar-width': `${(item.duration / totalWeeks) * 100}%`,
                      width: `${(item.duration / totalWeeks) * 100}%`,
                      animationDelay: `${300 + i * 60}ms`,
                    } as React.CSSProperties}
                  >
                    {item.done && (
                      <div className="absolute inset-0 flex items-center justify-end pr-1.5">
                        <Check size={10} className="text-white/70" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Current week indicator line */}
            <div className="relative h-0">
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500/50 -mt-[400px] h-[400px] z-10"
                style={{ left: `calc(12rem + ${((currentWeek - 0.5) / totalWeeks) * 100}% * (100% - 12rem) / 100%)` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Phase Legend */}
      <div className="flex flex-wrap gap-3">
        {PROJECT_PHASES.map((phase, i) => {
          const barColors: Record<string, string> = { blue: 'bg-blue-500', amber: 'bg-amber-500', purple: 'bg-purple-500', cyan: 'bg-cyan-500', green: 'bg-green-500' };
          return (
            <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
              <span className={`w-3 h-2 rounded-sm ${barColors[phase.accent]}`} />
              {phase.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TeamView = () => (
  <div className="space-y-5">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Team</h2>
        <p className="text-gray-500 text-xs">Members, capacity & performance</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20">
        <Plus size={14} aria-hidden="true" /> Invite Member
      </button>
    </div>

    {/* Team Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TEAM_MEMBERS.map((m, i) => (
        <Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl ${m.avatar} flex items-center justify-center text-sm font-bold text-white border border-white/10`}>{m.initials}</div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111] ${m.online ? 'bg-green-500' : 'bg-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{m.name}</div>
                  <div className="text-[10px] text-gray-500">{m.role}</div>
                </div>
                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${m.online ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                  {m.online ? 'Online' : 'Away'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-center">
              <div className="text-lg font-mono font-bold text-white">{m.tasksActive}</div>
              <div className="text-[9px] text-gray-500 uppercase">Active</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-center">
              <div className="text-lg font-mono font-bold text-white">{m.tasksDone}</div>
              <div className="text-[9px] text-gray-500 uppercase">Done</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-center">
              <div className={`text-lg font-mono font-bold ${m.capacity > 85 ? 'text-red-400' : m.capacity > 70 ? 'text-amber-400' : 'text-green-400'}`}>{m.capacity}%</div>
              <div className="text-[9px] text-gray-500 uppercase">Load</div>
            </div>
          </div>

          {/* Capacity bar */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Capacity</span>
              <span className="font-mono">{m.capacity}%</span>
            </div>
            <AnimatedBar width={m.capacity} color={m.capacity > 85 ? 'bg-red-500' : m.capacity > 70 ? 'bg-amber-500' : 'bg-blue-500'} delay={200 + i * 100} />
          </div>
        </Card>
      ))}
    </div>

    {/* Velocity chart */}
    <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Sprint Velocity</h3>
        <span className="text-[10px] font-mono text-green-400">+8.3% trend</span>
      </div>
      <div className="flex items-end justify-between h-28 gap-1.5" role="img" aria-label="Sprint velocity chart showing points delivered per sprint">
        {[28, 32, 35, 30, 38, 36, 42, 42].map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 group w-full">
            <span className="text-[9px] font-mono text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
            <div className="relative w-full rounded-t-md bg-[#1a1a1a] h-24 overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md animate-fill-bar"
                style={{ '--bar-width': `${(v / 45) * 100}%`, height: `${(v / 45) * 100}%`, animationDelay: `${600 + i * 60}ms` } as React.CSSProperties}
              />
            </div>
            <span className="text-[9px] text-gray-600 font-mono">S{i + 1}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ============================================================
// MAIN PAGE
// ============================================================

export default function ProjectPlannerPage() {
  const [activeView, setActiveView] = useState('overview');
  const [notifOpen, setNotifOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <OverviewView />;
      case 'board': return <BoardView />;
      case 'timeline': return <TimelineView />;
      case 'team': return <TeamView />;
      default: return <OverviewView />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'overview': return 'Overview';
      case 'board': return 'Board';
      case 'timeline': return 'Timeline';
      case 'team': return 'Team';
      default: return 'Overview';
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#E2E2E2] font-sans overflow-hidden">

      {/* --- Sidebar --- */}
      <aside aria-label="Project planner sidebar navigation" className="w-20 md:w-64 flex-shrink-0 border-r border-[#222] hidden md:flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-4 mb-10 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="font-bold text-xl tracking-tight hidden md:block">Plan<span className="text-gray-600">Flow</span></span>
          </div>

          <div className="space-y-2">
            <NavItem icon={LayoutDashboard} label="Overview" id="overview" activeId={activeView} onClick={setActiveView} />
            <NavItem icon={KanbanSquare} label="Board" id="board" activeId={activeView} onClick={setActiveView} />
            <NavItem icon={GanttChart} label="Timeline" id="timeline" activeId={activeView} onClick={setActiveView} />
            <NavItem icon={Users} label="Team" id="team" activeId={activeView} onClick={setActiveView} />
          </div>

          {/* Project Info */}
          <div className="mt-8 px-4">
            <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wider mb-3">Project</div>
            <div className="text-sm font-bold text-white mb-1">PlanFlow v2.0</div>
            <div className="text-[10px] text-gray-500 mb-3">Enterprise Project Planning</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Progress</span>
                <span className="text-[10px] font-mono text-blue-400">57%</span>
              </div>
              <AnimatedBar width={57} color="bg-blue-500" delay={200} />
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500">Sprint</span>
                <span className="font-mono text-white">8 / 13</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-[#111] rounded-2xl p-4 mb-4 border border-[#222]">
            <div className="flex items-center gap-2 mb-2">
              <Flag size={12} className="text-amber-400" aria-hidden="true" />
              <span className="text-[10px] font-bold text-amber-400 uppercase">Next Milestone</span>
            </div>
            <div className="text-xs font-bold text-white mb-0.5">Beta Testing</div>
            <div className="text-[10px] text-gray-500">Feb 28 — 20 days left</div>
          </div>

          <Link href="/projects" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-all">
            <LogOut size={20} aria-hidden="true" />
            <span className="font-medium text-sm">Exit Demo</span>
          </Link>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-[#222] flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-4 md:w-80">
            <button className="md:hidden p-2 text-gray-400" aria-label="Open sidebar menu"><MoreHorizontal aria-hidden="true" /></button>
            <div className="relative w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} aria-hidden="true" />
              <input
                type="search"
                aria-label={`Search in ${getHeaderTitle()}`}
                placeholder={`Search ${getHeaderTitle().toLowerCase()}...`}
                className="w-full bg-[#111] border border-[#222] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-green-400 uppercase">4 online</span>
            </span>
            <div className="md:hidden">
              <Link href="/projects" className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                <LogOut size={14} aria-hidden="true" /> Exit
              </Link>
            </div>
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)} className="p-2 rounded-lg transition-all group hover:bg-[#222] text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 relative" aria-label="Notifications">
                <Bell size={18} className="text-gray-500 group-hover:text-white" aria-hidden="true" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#050505]" />
              </button>
              <PlannerNotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Team avatars */}
            <div className="hidden sm:flex -space-x-2">
              {TEAM_MEMBERS.map((m, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${m.avatar} flex items-center justify-center text-[8px] font-bold text-white border-2 border-[#050505]`}>{m.initials}</div>
              ))}
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-[#222]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-[#222] flex items-center justify-center text-[10px] font-bold text-white">VM</div>
              <ChevronDown size={14} className="text-gray-600 hidden md:block" aria-hidden="true" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}
