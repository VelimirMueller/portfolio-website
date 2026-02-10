'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  Table2,
  Database,
  Zap,
  Shield,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Menu,
  X,
  Check,
  Copy,
  Key,
  Lock,
  Users,
  Eye,
  Trash2,
  Edit3,
  ArrowUpRight,
  Activity,
  HardDrive,
  Layers,
  Code2,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Link2,
  Filter,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  FileText,
} from 'lucide-react';

// ============================================================
// DATA
// ============================================================

const TABLES = [
  { name: 'users', rows: 2847, columns: 8, size: '4.2 MB', rls: true, lastModified: '2 min ago' },
  { name: 'projects', rows: 156, columns: 12, size: '1.8 MB', rls: true, lastModified: '15 min ago' },
  { name: 'tasks', rows: 4923, columns: 14, size: '8.1 MB', rls: true, lastModified: '5 min ago' },
  { name: 'comments', rows: 12840, columns: 6, size: '12.4 MB', rls: true, lastModified: '1 min ago' },
  { name: 'attachments', rows: 892, columns: 7, size: '2.1 MB', rls: false, lastModified: '1h ago' },
  { name: 'notifications', rows: 8456, columns: 9, size: '5.7 MB', rls: true, lastModified: '30s ago' },
  { name: 'team_members', rows: 48, columns: 6, size: '0.1 MB', rls: true, lastModified: '3h ago' },
  { name: 'audit_log', rows: 45200, columns: 10, size: '28.3 MB', rls: false, lastModified: '10s ago' },
];

const USERS_DATA = [
  { id: 'usr_01', email: 'velimir@example.com', role: 'admin', provider: 'email', created: 'Jan 3, 2026', lastLogin: '2 min ago', confirmed: true },
  { id: 'usr_02', email: 'sarah.k@company.io', role: 'editor', provider: 'google', created: 'Jan 5, 2026', lastLogin: '1h ago', confirmed: true },
  { id: 'usr_03', email: 'alex.j@dev.co', role: 'editor', provider: 'github', created: 'Jan 12, 2026', lastLogin: '3h ago', confirmed: true },
  { id: 'usr_04', email: 'lena.p@startup.de', role: 'viewer', provider: 'email', created: 'Jan 20, 2026', lastLogin: '1d ago', confirmed: true },
  { id: 'usr_05', email: 'demo@test.com', role: 'viewer', provider: 'email', created: 'Feb 1, 2026', lastLogin: 'Never', confirmed: false },
];

const TABLE_COLUMNS = [
  { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', primary: true },
  { name: 'email', type: 'text', nullable: false, default: null, primary: false },
  { name: 'full_name', type: 'text', nullable: true, default: null, primary: false },
  { name: 'avatar_url', type: 'text', nullable: true, default: null, primary: false },
  { name: 'role', type: 'text', nullable: false, default: "'viewer'", primary: false },
  { name: 'is_active', type: 'boolean', nullable: false, default: 'true', primary: false },
  { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()', primary: false },
  { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()', primary: false },
];

const SAMPLE_ROWS = [
  { id: 'a1b2c3d4...', email: 'velimir@example.com', full_name: 'Velimir Müller', avatar_url: null, role: 'admin', is_active: true, created_at: '2026-01-03T...', updated_at: '2026-02-08T...' },
  { id: 'e5f6g7h8...', email: 'sarah.k@company.io', full_name: 'Sarah Kim', avatar_url: 'https://...', role: 'editor', is_active: true, created_at: '2026-01-05T...', updated_at: '2026-02-07T...' },
  { id: 'i9j0k1l2...', email: 'alex.j@dev.co', full_name: 'Alex Johnson', avatar_url: null, role: 'editor', is_active: true, created_at: '2026-01-12T...', updated_at: '2026-02-06T...' },
  { id: 'm3n4o5p6...', email: 'lena.p@startup.de', full_name: 'Lena Patel', avatar_url: 'https://...', role: 'viewer', is_active: true, created_at: '2026-01-20T...', updated_at: '2026-02-05T...' },
  { id: 'q7r8s9t0...', email: 'demo@test.com', full_name: null, avatar_url: null, role: 'viewer', is_active: false, created_at: '2026-02-01T...', updated_at: '2026-02-01T...' },
];

const API_ENDPOINTS = [
  { method: 'GET', path: '/rest/v1/users', description: 'List all users', auth: true },
  { method: 'GET', path: '/rest/v1/users?id=eq.{id}', description: 'Get user by ID', auth: true },
  { method: 'POST', path: '/rest/v1/users', description: 'Create new user', auth: true },
  { method: 'PATCH', path: '/rest/v1/users?id=eq.{id}', description: 'Update user', auth: true },
  { method: 'DELETE', path: '/rest/v1/users?id=eq.{id}', description: 'Delete user', auth: true },
  { method: 'GET', path: '/rest/v1/projects', description: 'List all projects', auth: true },
  { method: 'GET', path: '/rest/v1/tasks?select=*,projects(*)', description: 'Tasks with project join', auth: true },
  { method: 'POST', path: '/rest/v1/rpc/get_user_stats', description: 'Custom RPC function', auth: true },
];

const RLS_POLICIES = [
  { table: 'users', name: 'Users can view own profile', command: 'SELECT', using: 'auth.uid() = id', active: true },
  { table: 'users', name: 'Admins can view all users', command: 'SELECT', using: "role = 'admin'", active: true },
  { table: 'projects', name: 'Team members can view projects', command: 'SELECT', using: 'auth.uid() IN (SELECT user_id FROM team_members WHERE project_id = id)', active: true },
  { table: 'tasks', name: 'Assigned users can update tasks', command: 'UPDATE', using: 'auth.uid() = assignee_id', active: true },
  { table: 'comments', name: 'Authenticated users can insert', command: 'INSERT', using: 'auth.uid() IS NOT NULL', active: true },
  { table: 'attachments', name: 'No RLS policies defined', command: '—', using: '—', active: false },
];

const NOTIFICATIONS = [
  { text: 'Migration applied: add_team_roles', time: '30s ago', icon: CheckCircle2, color: 'text-green-400', read: false },
  { text: 'RLS policy updated on projects', time: '5m ago', icon: Shield, color: 'text-blue-400', read: false },
  { text: 'API usage spike: 2.4K req/min', time: '12m ago', icon: AlertCircle, color: 'text-amber-400', read: false },
  { text: 'New user signup: lena.p@startup.de', time: '1h ago', icon: UserCheck, color: 'text-purple-400', read: true },
  { text: 'Backup completed: 62.7 MB', time: '3h ago', icon: HardDrive, color: 'text-gray-400', read: true },
];

// ============================================================
// SHARED UI
// ============================================================

const Card = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`bg-[#0d1117] rounded-xl p-5 border border-[#1e2d3d] hover:border-[#2d4a5e] transition-colors ${className}`} style={style}>
    {children}
  </div>
);

const NavItem = ({ icon: Icon, label, id, activeId, onClick }: { icon: React.ElementType; label: string; id: string; activeId: string; onClick: (id: string) => void }) => (
  <button
    onClick={() => onClick(id)}
    aria-current={activeId === id ? 'page' : undefined}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${activeId === id ? 'bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20' : 'text-gray-400 hover:bg-[#1a2332] hover:text-white'}`}
  >
    <Icon size={18} aria-hidden="true" />
    <span>{label}</span>
  </button>
);

const Badge = ({ children, color = 'green' }: { children: React.ReactNode; color?: string }) => {
  const styles: Record<string, string> = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${styles[color] || styles.green}`}>
      {children}
    </span>
  );
};

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: 'text-emerald-400 bg-emerald-500/10',
    POST: 'text-blue-400 bg-blue-500/10',
    PATCH: 'text-amber-400 bg-amber-500/10',
    DELETE: 'text-red-400 bg-red-500/10',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
};

const TypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ElementType> = { uuid: Key, text: Type, boolean: ToggleLeft, timestamptz: Calendar };
  const Icon = icons[type] || Hash;
  return <Icon size={12} className="text-gray-600" aria-hidden="true" />;
};

// ============================================================
// NOTIFICATION DROPDOWN
// ============================================================

const NotificationDropdown = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 w-80 bg-[#0d1117] border border-[#1e2d3d] rounded-xl shadow-2xl shadow-black/50 z-50 animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d3d]">
          <span className="text-xs font-bold text-white">Notifications</span>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{NOTIFICATIONS.filter(n => !n.read).length} new</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 border-b border-[#1e2d3d]/50 hover:bg-[#1a2332] transition-colors ${!n.read ? 'bg-emerald-500/[0.02]' : ''}`}>
              <div className={`mt-0.5 ${n.color}`}>
                <n.icon size={14} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] leading-relaxed ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.text}</div>
                <span className="text-[9px] text-gray-600 font-mono">{n.time}</span>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-[#1e2d3d]">
          <button className="text-[10px] text-emerald-400 font-bold hover:text-emerald-300 w-full text-center">Mark all as read</button>
        </div>
      </div>
    </>
  );
};

// ============================================================
// VIEWS
// ============================================================

const OverviewView = () => (
  <div className="space-y-5">
    {/* Stats Row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Total Tables', value: TABLES.length, icon: Table2, color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Total Rows', value: '75.3K', icon: Database, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Database Size', value: '62.7 MB', icon: HardDrive, color: 'text-purple-400 bg-purple-500/10' },
        { label: 'API Requests', value: '24.1K/d', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
      ].map((stat, i) => (
        <Card key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon size={16} aria-hidden="true" />
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-white">{stat.value}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
        </Card>
      ))}
    </div>

    {/* Tables + Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-bold text-white">Tables</h3>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-500 transition-colors">
            <Plus size={12} aria-hidden="true" /> New Table
          </button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1e2d3d] text-[10px] text-gray-500 uppercase font-mono">
                <th scope="col" className="px-5 py-2.5 font-medium">Name</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Rows</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Size</th>
                <th scope="col" className="px-5 py-2.5 font-medium">RLS</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d3d]/50">
              {TABLES.map((t, i) => (
                <tr key={t.name} className="hover:bg-[#1a2332] transition-colors cursor-pointer">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Table2 size={12} className="text-emerald-500" aria-hidden="true" />
                      <span className="text-xs font-mono font-bold text-white">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-xs font-mono text-gray-400">{t.rows.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-xs font-mono text-gray-400">{t.size}</td>
                  <td className="px-5 py-2.5">
                    {t.rls ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400"><Shield size={10} aria-hidden="true" /> On</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400"><AlertCircle size={10} aria-hidden="true" /> Off</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-[10px] text-gray-600 font-mono">{t.lastModified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Activity</h3>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400">Live</span>
          </span>
        </div>
        <div className="space-y-3">
          {[
            { action: 'INSERT', table: 'comments', time: '10s ago', color: 'text-emerald-400' },
            { action: 'UPDATE', table: 'tasks', time: '30s ago', color: 'text-amber-400' },
            { action: 'INSERT', table: 'audit_log', time: '45s ago', color: 'text-emerald-400' },
            { action: 'SELECT', table: 'users', time: '1m ago', color: 'text-blue-400' },
            { action: 'UPDATE', table: 'notifications', time: '2m ago', color: 'text-amber-400' },
            { action: 'DELETE', table: 'attachments', time: '5m ago', color: 'text-red-400' },
            { action: 'INSERT', table: 'projects', time: '8m ago', color: 'text-emerald-400' },
          ].map((q, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a2332] transition-colors ${i === 0 ? 'bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-transparent bg-[length:200%_100%] animate-shimmer' : ''}`}>
              <span className={`text-[9px] font-mono font-bold w-14 ${q.color}`}>{q.action}</span>
              <span className="text-[11px] font-mono text-white">{q.table}</span>
              <span className="text-[9px] text-gray-600 font-mono ml-auto">{q.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Connection Info */}
    <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <h3 className="text-sm font-bold text-white mb-3">Connection</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { label: 'Project URL', value: 'https://zkvpvhrmr.supabase.co' },
          { label: 'API Key', value: 'sb_pub_F-mjXO72s•••••••' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0f14] border border-[#1e2d3d]">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-500 uppercase mb-0.5">{item.label}</div>
              <div className="text-xs font-mono text-gray-300 truncate">{item.value}</div>
            </div>
            <button className="p-1.5 text-gray-500 hover:text-white transition-colors rounded hover:bg-[#1e2d3d]" aria-label={`Copy ${item.label}`}>
              <Copy size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const SchemaView = () => {
  const [migrationText, setMigrationText] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (migrationText.trim()) setGenerated(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Schema & Tables</h2>
          <p className="text-gray-500 text-xs">Define your database structure</p>
        </div>
      </div>

      {/* Migration Generator (from the design image) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="animate-fade-in-up border-emerald-500/10" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Plus size={16} className="text-emerald-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-white">New Table Migration</h3>
          </div>
          <div className="mb-3">
            <label htmlFor="migration-desc" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              id="migration-desc"
              value={migrationText}
              onChange={e => { setMigrationText(e.target.value); setGenerated(false); }}
              placeholder="e.g. Create a 'products' table with price, stock, and a foreign key to 'categories'. Also add an index on the name."
              className="w-full h-32 bg-[#0a0f14] border border-[#1e2d3d] rounded-lg px-4 py-3 text-sm text-gray-300 placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none resize-none font-mono"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={14} aria-hidden="true" /> Generate Schema
          </button>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-emerald-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-white">Generated Migration</h3>
            {generated && (
              <button className="ml-auto p-1 text-gray-500 hover:text-white transition-colors" aria-label="Copy SQL">
                <Copy size={12} aria-hidden="true" />
              </button>
            )}
          </div>
          {generated ? (
            <pre className="bg-[#0a0f14] border border-[#1e2d3d] rounded-lg p-4 text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
              <span className="text-purple-400">CREATE TABLE</span> <span className="text-emerald-400">products</span> ({'\n'}
              {'  '}<span className="text-blue-400">id</span> <span className="text-amber-400">uuid</span> <span className="text-gray-500">DEFAULT</span> gen_random_uuid() <span className="text-red-400">PRIMARY KEY</span>,{'\n'}
              {'  '}<span className="text-blue-400">name</span> <span className="text-amber-400">text</span> <span className="text-red-400">NOT NULL</span>,{'\n'}
              {'  '}<span className="text-blue-400">price</span> <span className="text-amber-400">numeric(10,2)</span> <span className="text-red-400">NOT NULL</span>,{'\n'}
              {'  '}<span className="text-blue-400">stock</span> <span className="text-amber-400">integer</span> <span className="text-gray-500">DEFAULT</span> 0,{'\n'}
              {'  '}<span className="text-blue-400">category_id</span> <span className="text-amber-400">uuid</span> <span className="text-gray-500">REFERENCES</span> <span className="text-emerald-400">categories</span>(id),{'\n'}
              {'  '}<span className="text-blue-400">created_at</span> <span className="text-amber-400">timestamptz</span> <span className="text-gray-500">DEFAULT</span> now(){'\n'}
              );{'\n\n'}
              <span className="text-purple-400">CREATE INDEX</span> idx_products_name{'\n'}
              {'  '}<span className="text-gray-500">ON</span> <span className="text-emerald-400">products</span>(name);
            </pre>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-600">
              <Table2 size={32} className="mb-2 opacity-30" aria-hidden="true" />
              <span className="text-xs">SQL definition will appear here</span>
            </div>
          )}
        </Card>
      </div>

      {/* Column Schema */}
      <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <Table2 size={14} className="text-emerald-500" aria-hidden="true" />
            <h3 className="text-sm font-bold text-white">users</h3>
            <Badge color="green">{TABLE_COLUMNS.length} columns</Badge>
          </div>
          <button className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold hover:text-emerald-300">
            <Plus size={12} aria-hidden="true" /> Add Column
          </button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1e2d3d] text-[10px] text-gray-500 uppercase font-mono">
                <th scope="col" className="px-5 py-2.5 font-medium">Column</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Type</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Nullable</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Default</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d3d]/50">
              {TABLE_COLUMNS.map((col) => (
                <tr key={col.name} className="hover:bg-[#1a2332] transition-colors">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <TypeIcon type={col.type} />
                      <span className="text-xs font-mono font-bold text-white">{col.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5"><Badge color="cyan">{col.type}</Badge></td>
                  <td className="px-5 py-2.5 text-[10px]">{col.nullable ? <span className="text-gray-500">Yes</span> : <span className="text-amber-400">NOT NULL</span>}</td>
                  <td className="px-5 py-2.5 text-[10px] font-mono text-gray-500">{col.default || '—'}</td>
                  <td className="px-5 py-2.5">{col.primary && <Badge color="amber">PK</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const DataBrowserView = () => {
  const [selectedTable, setSelectedTable] = useState('users');

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Data Browser</h2>
          <p className="text-gray-500 text-xs">Browse and edit table data</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2332] text-white text-[10px] font-bold rounded-lg border border-[#1e2d3d] hover:bg-[#243040]">
            <Filter size={12} aria-hidden="true" /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-500">
            <Plus size={12} aria-hidden="true" /> Insert Row
          </button>
        </div>
      </div>

      {/* Table selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABLES.slice(0, 5).map(t => (
          <button
            key={t.name}
            onClick={() => setSelectedTable(t.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-colors whitespace-nowrap ${selectedTable === t.name ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-[#0d1117] text-gray-500 border border-[#1e2d3d] hover:text-white'}`}
          >
            <Table2 size={10} aria-hidden="true" /> {t.name}
          </button>
        ))}
      </div>

      {/* Data Grid */}
      <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1e2d3d] text-[10px] text-gray-500 uppercase font-mono bg-[#0a0f14]">
                <th scope="col" className="px-4 py-3 font-medium w-8">
                  <input type="checkbox" className="w-3 h-3 rounded bg-[#0a0f14] border-[#1e2d3d]" aria-label="Select all rows" />
                </th>
                {TABLE_COLUMNS.map(col => (
                  <th key={col.name} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d3d]/50">
              {SAMPLE_ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-[#1a2332] transition-colors group">
                  <td className="px-4 py-2.5">
                    <input type="checkbox" className="w-3 h-3 rounded bg-[#0a0f14] border-[#1e2d3d]" aria-label={`Select row ${i + 1}`} />
                  </td>
                  <td className="px-4 py-2.5 text-[10px] font-mono text-gray-500">{row.id}</td>
                  <td className="px-4 py-2.5 text-[11px] font-mono text-white">{row.email}</td>
                  <td className="px-4 py-2.5 text-[11px] text-gray-300">{row.full_name || <span className="text-gray-600 italic">null</span>}</td>
                  <td className="px-4 py-2.5 text-[10px] text-gray-500 truncate max-w-[80px]">{row.avatar_url || <span className="text-gray-600 italic">null</span>}</td>
                  <td className="px-4 py-2.5"><Badge color={row.role === 'admin' ? 'amber' : row.role === 'editor' ? 'blue' : 'gray'}>{row.role}</Badge></td>
                  <td className="px-4 py-2.5">
                    {row.is_active ? <span className="text-emerald-400 text-[10px]">true</span> : <span className="text-red-400 text-[10px]">false</span>}
                  </td>
                  <td className="px-4 py-2.5 text-[10px] font-mono text-gray-500">{row.created_at}</td>
                  <td className="px-4 py-2.5 text-[10px] font-mono text-gray-500">{row.updated_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#1e2d3d] bg-[#0a0f14] flex justify-between items-center">
          <span className="text-[10px] text-gray-500 font-mono">{SAMPLE_ROWS.length} of {TABLES.find(t => t.name === selectedTable)?.rows.toLocaleString()} rows</span>
          <div className="flex gap-1.5">
            <button className="px-2.5 py-1 rounded border border-[#1e2d3d] text-[10px] text-gray-400 hover:text-white hover:bg-[#1a2332]">Prev</button>
            <button className="px-2.5 py-1 rounded border border-[#1e2d3d] text-[10px] text-gray-400 hover:text-white hover:bg-[#1a2332]">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ApiBuilderView = () => {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (i: number) => {
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">API Builder</h2>
          <p className="text-gray-500 text-xs">Auto-generated RESTful endpoints</p>
        </div>
        <Badge color="green">PostgREST v12</Badge>
      </div>

      {/* API Keys */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-sm font-bold text-white mb-3">API Keys</h3>
        <div className="space-y-2">
          {[
            { label: 'anon (public)', key: 'eyJhbGciOiJIUzI1NiIs•••••', role: 'Public access' },
            { label: 'service_role', key: 'eyJhbGciOiJIUzI1NiIs•••••', role: 'Admin access — keep secret' },
          ].map((k, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0f14] border border-[#1e2d3d]">
              <Key size={12} className={i === 0 ? 'text-emerald-400' : 'text-red-400'} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-bold text-white">{k.label}</div>
                <div className="text-[10px] font-mono text-gray-600 truncate">{k.key}</div>
              </div>
              <span className="text-[9px] text-gray-500 hidden sm:block">{k.role}</span>
              <button className="p-1.5 text-gray-500 hover:text-white transition-colors" aria-label={`Copy ${k.label} key`}>
                <Copy size={12} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Endpoints */}
      <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="p-5 pb-0 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Endpoints</h3>
          <span className="text-[10px] font-mono text-gray-500">{API_ENDPOINTS.length} routes</span>
        </div>
        <div className="divide-y divide-[#1e2d3d]/50 mt-4">
          {API_ENDPOINTS.map((ep, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1a2332] transition-colors group">
              <MethodBadge method={ep.method} />
              <code className="text-[11px] font-mono text-gray-300 flex-1 truncate">{ep.path}</code>
              <span className="text-[10px] text-gray-600 hidden md:block">{ep.description}</span>
              {ep.auth && <Lock size={10} className="text-amber-500" aria-hidden="true" />}
              <button
                onClick={() => handleCopy(i)}
                className="p-1.5 text-gray-600 hover:text-white transition-colors"
                aria-label={`Copy ${ep.method} ${ep.path}`}
              >
                {copied === i ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Code Example */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Quick Start</h3>
          <div className="flex gap-1">
            <button className="px-2.5 py-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">JavaScript</button>
            <button className="px-2.5 py-1 text-[10px] font-mono text-gray-500 rounded border border-[#1e2d3d] hover:text-white">cURL</button>
          </div>
        </div>
        <pre className="bg-[#0a0f14] border border-[#1e2d3d] rounded-lg p-4 text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
          <span className="text-purple-400">import</span> {'{ createClient }'} <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;@supabase/supabase-js&apos;</span>{'\n\n'}
          <span className="text-purple-400">const</span> supabase = <span className="text-blue-400">createClient</span>({'\n'}
          {'  '}<span className="text-emerald-400">&apos;https://zkvpvhrmr.supabase.co&apos;</span>,{'\n'}
          {'  '}<span className="text-emerald-400">&apos;your-anon-key&apos;</span>{'\n'}
          ){'\n\n'}
          <span className="text-gray-500">{'// Fetch all users'}</span>{'\n'}
          <span className="text-purple-400">const</span> {'{ data, error }'} = <span className="text-purple-400">await</span> supabase{'\n'}
          {'  '}.<span className="text-blue-400">from</span>(<span className="text-emerald-400">&apos;users&apos;</span>){'\n'}
          {'  '}.<span className="text-blue-400">select</span>(<span className="text-emerald-400">&apos;*&apos;</span>)
        </pre>
      </Card>
    </div>
  );
};

const AuthView = () => (
  <div className="space-y-5">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Auth & Security</h2>
        <p className="text-gray-500 text-xs">Users, providers, and Row Level Security</p>
      </div>
    </div>

    {/* Auth Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Total Users', value: USERS_DATA.length, icon: Users, color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Confirmed', value: USERS_DATA.filter(u => u.confirmed).length, icon: CheckCircle2, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Providers', value: 3, icon: Key, color: 'text-purple-400 bg-purple-500/10' },
        { label: 'RLS Policies', value: RLS_POLICIES.filter(p => p.active).length, icon: Shield, color: 'text-amber-400 bg-amber-500/10' },
      ].map((stat, i) => (
        <Card key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
          <div className={`p-2 rounded-lg ${stat.color} w-fit mb-2`}>
            <stat.icon size={14} aria-hidden="true" />
          </div>
          <div className="text-lg font-mono font-bold text-white">{stat.value}</div>
          <div className="text-[10px] text-gray-500">{stat.label}</div>
        </Card>
      ))}
    </div>

    {/* Users Table */}
    <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between p-5 pb-0">
        <h3 className="text-sm font-bold text-white">Users</h3>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-500">
          <Plus size={12} aria-hidden="true" /> Add User
        </button>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1e2d3d] text-[10px] text-gray-500 uppercase font-mono">
              <th scope="col" className="px-5 py-2.5 font-medium">Email</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Role</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Provider</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Last Login</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d3d]/50">
            {USERS_DATA.map((u, i) => (
              <tr key={u.id} className="hover:bg-[#1a2332] transition-colors">
                <td className="px-5 py-2.5 text-[11px] font-mono text-white">{u.email}</td>
                <td className="px-5 py-2.5"><Badge color={u.role === 'admin' ? 'amber' : u.role === 'editor' ? 'blue' : 'gray'}>{u.role}</Badge></td>
                <td className="px-5 py-2.5"><Badge color={u.provider === 'google' ? 'blue' : u.provider === 'github' ? 'purple' : 'gray'}>{u.provider}</Badge></td>
                <td className="px-5 py-2.5">
                  {u.confirmed ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400"><CheckCircle2 size={10} aria-hidden="true" /> Confirmed</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400"><Clock size={10} aria-hidden="true" /> Pending</span>
                  )}
                </td>
                <td className="px-5 py-2.5 text-[10px] text-gray-500 font-mono">{u.lastLogin}</td>
                <td className="px-5 py-2.5 text-[10px] text-gray-500 font-mono">{u.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    {/* RLS Policies */}
    <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between p-5 pb-0">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-emerald-500" aria-hidden="true" />
          <h3 className="text-sm font-bold text-white">Row Level Security Policies</h3>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold hover:text-emerald-300">
          <Plus size={12} aria-hidden="true" /> Add Policy
        </button>
      </div>
      <div className="divide-y divide-[#1e2d3d]/50 mt-4">
        {RLS_POLICIES.map((p, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-[#1a2332] transition-colors">
            <div className={`w-1.5 h-8 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold text-white">{p.name}</span>
                <Badge color="gray">{p.table}</Badge>
              </div>
              <code className="text-[10px] font-mono text-gray-500 truncate block">{p.using}</code>
            </div>
            <Badge color={p.command === 'SELECT' ? 'blue' : p.command === 'INSERT' ? 'green' : p.command === 'UPDATE' ? 'amber' : 'gray'}>{p.command}</Badge>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ============================================================
// MAIN PAGE
// ============================================================

export default function SupabaseAdminPage() {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <OverviewView />;
      case 'schema': return <SchemaView />;
      case 'data': return <DataBrowserView />;
      case 'api': return <ApiBuilderView />;
      case 'auth': return <AuthView />;
      default: return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#070b10] text-[#E2E2E2] font-sans overflow-hidden">

      {/* --- Sidebar --- */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside aria-label="Supabase admin sidebar navigation" className={`${sidebarOpen ? 'flex fixed inset-y-0 left-0 z-40 w-56' : 'hidden'} md:flex md:relative md:w-56 flex-shrink-0 border-r border-[#1e2d3d] flex-col justify-between p-4 bg-[#0a0f14]`}>
        <div>
          <div className="flex items-center gap-3 px-3 mb-10 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-bold text-white text-lg">
              &gt;
            </div>
            <span className="font-bold text-base tracking-tight hidden md:block text-white">Supabase<span className="text-gray-600">Kit</span></span>
          </div>

          <div className="space-y-1">
            <NavItem icon={Home} label="Overview" id="overview" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={Table2} label="Schema & Tables" id="schema" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={Database} label="Data Browser" id="data" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={Zap} label="API Builder" id="api" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={Shield} label="Auth & Security" id="auth" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
          </div>
        </div>

        <div>
          <div className="bg-[#0d1117] rounded-xl p-3 mb-3 border border-[#1e2d3d]">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-emerald-400" aria-hidden="true" />
              <span className="text-[10px] font-bold text-emerald-400">Database Health</span>
            </div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-gray-500">Uptime</span>
              <span className="font-mono text-white">99.98%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500">Latency</span>
              <span className="font-mono text-emerald-400">12ms</span>
            </div>
          </div>

          <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#1a2332] transition-all text-sm">
            <LogOut size={18} aria-hidden="true" />
            <span>Exit Demo</span>
          </Link>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 border-b border-[#1e2d3d] flex items-center justify-between px-6 bg-[#070b10]/80 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-gray-400" aria-label="Open sidebar menu" onClick={() => setSidebarOpen(o => !o)}>{sidebarOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} aria-hidden="true" />
              <input
                type="search"
                aria-label="Search tables, columns, or queries"
                placeholder="Search tables, columns..."
                className="w-72 bg-[#0d1117] border border-[#1e2d3d] rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400">Connected</span>
            </span>
            <div className="md:hidden">
              <Link href="/projects" className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                <LogOut size={14} aria-hidden="true" /> Exit
              </Link>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg transition-all group hover:bg-[#1a2332] text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 relative"
                aria-label="Notifications"
              >
                <Bell size={16} className="group-hover:text-white" aria-hidden="true" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-[#070b10]" />
              </button>
              <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-[#1e2d3d]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0a0f14]">VM</div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-white">Velimir M.</div>
                <div className="text-[9px] text-gray-500">Owner</div>
              </div>
              <ChevronDown size={12} className="text-gray-600 hidden md:block" aria-hidden="true" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}
