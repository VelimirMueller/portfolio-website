'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, LogOut, Menu, Search, X } from 'lucide-react';
import { findView, VIEWS, type ViewId } from '../_lib/views';
import { AnalyticsView } from './AnalyticsView';
import { DashboardView } from './DashboardView';
import { CRMNotificationDropdown } from './NotificationDropdown';
import { PipelineView } from './PipelineView';
import { SettingsView } from './settings/SettingsView';
import { NavItem } from './ui';
import { WorkflowsView } from './WorkflowsView';

const VIEW_COMPONENTS: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  pipeline: PipelineView,
  workflows: WorkflowsView,
  analytics: AnalyticsView,
  settings: SettingsView,
};

/** The CRM demo: sidebar, header and the active view. Owns which view and which overlay is open. */
export function DashboardDemo() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const view = findView(activeView);
  const ActiveView = VIEW_COMPONENTS[view.id];
  const getHeaderTitle = () => view.title;
  const openView = (id: string) => {
    setActiveView(id);
    setSidebarOpen(false);
  };

  return (
    <div className="relative isolate flex h-screen bg-[#050505] text-[#E2E2E2] font-sans overflow-hidden">
      {/* Backdrop for the glass: a faded brand render plus the demo's own blue and violet light. */}
      <div aria-hidden="true" className="absolute -z-10 inset-0 pointer-events-none bg-[url('/art/v2/site-svc-stack.webp')] bg-cover bg-center opacity-60 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]" />
      <div aria-hidden="true" className="absolute -z-10 top-[-10%] left-[15%] w-[40vw] h-[50vh] rounded-full bg-blue-600/25 blur-[140px] pointer-events-none" />
      <div aria-hidden="true" className="absolute -z-10 bottom-[-15%] right-[5%] w-[45vw] h-[55vh] rounded-full bg-violet-600/25 blur-[150px] pointer-events-none" />

      {/* --- Sidebar --- */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside aria-label="Dashboard sidebar navigation" className={`${sidebarOpen ? 'flex fixed inset-y-0 left-0 z-40 w-64' : 'hidden'} md:flex md:relative md:w-64 flex-shrink-0 border-r glass-demo-side flex-col justify-between p-4`}>
        <div>
          <div className="flex items-center gap-3 px-4 mb-12 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
              C
            </div>
            <span className="font-bold text-xl tracking-tight">CRM<span className="text-gray-600">Pro</span></span>
          </div>

          <div className="space-y-2">
            {VIEWS.map((v) => (
              <NavItem key={v.id} icon={v.icon} label={v.label} id={v.id} activeId={activeView} onClick={openView} />
            ))}
          </div>
        </div>

        <div>
          <div className="glass-demo rounded-2xl p-4 mb-4 border animate-pulse-glow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><Bell size={14} aria-hidden="true" /></div>
              <div>
                <div className="text-xs font-bold">Meeting</div>
                <div className="text-[10px] text-gray-500">In 15 min</div>
              </div>
            </div>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
              Join Slack Huddle
            </button>
          </div>

          <Link href="/projects" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-all">
            <LogOut size={20} aria-hidden="true" />
            <span className="font-medium text-sm">Exit Demo</span>
          </Link>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        <header className="h-20 border-b border-[#222] flex items-center justify-between px-4 sm:px-6 md:px-8 bg-[#050505]/60 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-4 md:w-96">
            <button className="md:hidden p-2 text-gray-400" aria-label="Open sidebar menu" onClick={() => setSidebarOpen(o => !o)}>{sidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>

            <div className="relative w-full hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} aria-hidden="true" />
              <input
                type="search"
                aria-label={`Search in ${getHeaderTitle()}`}
                placeholder={`Search in ${getHeaderTitle()}...`}
                className="w-full bg-[#111] border border-[#222] rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live indicator */}
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-green-400 uppercase">Live</span>
            </span>
            <div className="md:hidden">
              <Link href="/projects" className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                <LogOut size={14} aria-hidden="true" /> Exit
              </Link>
            </div>
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-3 rounded-xl transition-all group hover:bg-[#222] text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 relative" aria-label="Notifications">
                <Bell size={20} className="text-gray-500 group-hover:text-white" aria-hidden="true" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#050505]" />
              </button>
              <CRMNotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-[#222]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-[#222] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/avatar-velimir.svg" alt="User" className="w-full h-full rounded-full" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full"></div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold">Velimir M.</div>
                <div className="text-[10px] text-gray-500">Admin</div>
              </div>
              <ChevronDown size={14} className="text-gray-600" aria-hidden="true" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            <ActiveView />
          </div>
        </div>
      </main>
    </div>
  );
}
