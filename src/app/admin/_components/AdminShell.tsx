'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { ArrowUpRight, BarChart3, Inbox, LogOut, Menu, X } from 'lucide-react';
import { signOut } from '../actions';

/**
 * App frame copied from the CRM demo: fixed sidebar, blurred header,
 * scrolling content area. Search lives in each section (the inbox list). Sections beyond the inbox get a
 * NAV entry here when they exist.
 */
const NAV = [
  { href: '/admin', label: 'Inbox', icon: Inbox, exact: true },
  { href: '/admin/kpis', label: 'KPIs', icon: BarChart3, exact: false },
] as const;

export function AdminShell({
  unread,
  email,
  version,
  children,
}: {
  unread: number;
  email: string;
  /** App version from package.json, shown under the logo. */
  version?: string;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#050505] text-[#E2E2E2] font-sans overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        aria-label="Admin navigation"
        className={`${
          sidebarOpen ? 'flex fixed inset-y-0 left-0 z-40 w-64' : 'hidden'
        } md:flex md:relative md:w-64 flex-shrink-0 border-r border-[#222] flex-col justify-between p-4 bg-[#050505]`}
      >
        <div>
          <div className="flex items-center gap-3 px-4 mb-12 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
              V
            </div>
            <span className="font-bold text-xl tracking-tight">
              Velimir<span className="text-gray-600">Admin</span>
            </span>
            {version && (
              <span className="ml-auto px-1.5 py-0.5 rounded-md border border-[#222] text-[9px] font-mono text-gray-500">
                v{version}
              </span>
            )}
          </div>

          <nav className="space-y-2">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              // Inbox owns /admin and message links; other sections own their subtree.
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active ? 'bg-blue-600/10 text-blue-400' : 'text-gray-500 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span className="font-medium text-sm flex-1">{label}</span>
                  {href === '/admin' && unread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-1">
          <Link
            href="/de"
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-all"
          >
            <ArrowUpRight size={20} aria-hidden="true" />
            <span className="font-medium text-sm">View site</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-all"
            >
              <LogOut size={20} aria-hidden="true" />
              <span className="font-medium text-sm">Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 border-b border-[#222] flex items-center justify-between px-4 sm:px-6 md:px-8 bg-[#050505]/80 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-4 md:w-96">
            <button
              className="md:hidden p-2 text-gray-400"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setSidebarOpen((o) => !o)}
            >
              {sidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>

          </div>

          <div className="flex items-center gap-3 pl-6 border-l border-[#222]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-[#222] relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatar-velimir.svg"
                alt=""
                className="w-full h-full rounded-full"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full" />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-bold">Velimir M.</div>
              <div className="text-[10px] text-gray-500 max-w-40 truncate">{email}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
