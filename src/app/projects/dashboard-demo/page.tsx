'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  MoreHorizontal,
  Menu,
  X,
  Mail,
  Filter,
  Plus,
  ArrowUpRight,
  Globe,
  Check,
  Zap,
  Clock,
  Edit3,
  DollarSign,
  Target,
  UserCheck,
  Activity,
  Workflow,
  Play,
  Pause,
  Phone,
  Timer,
  AlertCircle,
  CircleDot,
  Building2,
  Calendar,
} from 'lucide-react';

// ============================================================
// DATA CONSTANTS
// ============================================================

const KPI_DATA = [
  { label: 'MRR', value: 127400, prefix: '$', suffix: '', trend: +14.2, trendLabel: 'vs last month', icon: DollarSign, color: 'blue', sparkline: [62, 68, 65, 74, 78, 82, 85, 91, 95, 102, 115, 127] },
  { label: 'Active Pipeline', value: 2400000, prefix: '$', suffix: '', trend: +23.1, trendLabel: 'vs last quarter', icon: Target, color: 'purple', sparkline: [1.2, 1.4, 1.1, 1.6, 1.8, 1.7, 2.0, 1.9, 2.1, 2.2, 2.3, 2.4] },
  { label: 'Win Rate', value: 68, prefix: '', suffix: '%', trend: +5.3, trendLabel: 'pp vs last quarter', icon: UserCheck, color: 'green', sparkline: [52, 55, 58, 56, 60, 59, 62, 63, 61, 65, 66, 68] },
  { label: 'CAC', value: 1240, prefix: '$', suffix: '', trend: -18.4, trendLabel: 'vs last quarter', icon: Activity, color: 'emerald', sparkline: [1800, 1720, 1650, 1580, 1520, 1490, 1440, 1400, 1360, 1320, 1280, 1240] },
];

const MRR_DATA = [
  { month: 'Mar', value: 62000 }, { month: 'Apr', value: 68000 }, { month: 'May', value: 72000 },
  { month: 'Jun', value: 74000 }, { month: 'Jul', value: 81000 }, { month: 'Aug', value: 85000 },
  { month: 'Sep', value: 91000 }, { month: 'Oct', value: 98000 }, { month: 'Nov', value: 105000 },
  { month: 'Dec', value: 112000 }, { month: 'Jan', value: 119000 }, { month: 'Feb', value: 127400 },
];

const ACTIVITIES = [
  { action: 'Deal closed', detail: 'Acme Corp — $84,000 ARR', time: '2 min ago', icon: CheckCircle2, color: 'text-green-400' },
  { action: 'New lead assigned', detail: 'DataFlow Inc → Sarah K.', time: '8 min ago', icon: UserCheck, color: 'text-blue-400' },
  { action: 'Meeting booked', detail: 'CloudNine — Discovery call', time: '14 min ago', icon: Calendar, color: 'text-purple-400' },
  { action: 'Proposal sent', detail: 'Vertex AI — $120K deal', time: '31 min ago', icon: Mail, color: 'text-orange-400' },
  { action: 'Pipeline moved', detail: 'NovaTech → Negotiation', time: '1h ago', icon: ArrowUpRight, color: 'text-indigo-400' },
  { action: 'New signup', detail: 'StartupXYZ — Trial started', time: '2h ago', icon: Zap, color: 'text-yellow-400' },
];

const TOP_DEALS = [
  { company: 'Vertex AI', contact: 'Marcus Chen', value: 120000, stage: 'Proposal', probability: 72, close: 'Feb 28', color: 'orange' as const },
  { company: 'Acme Corp', contact: 'Sarah Kim', value: 84000, stage: 'Negotiation', probability: 88, close: 'Feb 14', color: 'purple' as const },
  { company: 'CloudNine', contact: 'David Park', value: 96000, stage: 'Demo', probability: 45, close: 'Mar 15', color: 'blue' as const },
  { company: 'DataFlow', contact: 'Emma Wilson', value: 67000, stage: 'Qualified', probability: 35, close: 'Mar 30', color: 'green' as const },
  { company: 'NovaTech', contact: 'James Liu', value: 150000, stage: 'Negotiation', probability: 65, close: 'Feb 21', color: 'purple' as const },
];

const TODAY_ACTIONS = [
  { text: 'Follow up on Vertex AI proposal', priority: 'high', overdue: true },
  { text: 'Discovery call with CloudNine (2pm)', priority: 'high', overdue: false },
  { text: 'Send NovaTech revised pricing', priority: 'medium', overdue: false },
  { text: 'Quarterly pipeline review prep', priority: 'medium', overdue: false },
  { text: 'Update CRM notes for DataFlow', priority: 'low', overdue: false },
];

const PIPELINE_STAGES = [
  { name: 'New Leads', count: 12, value: 340000, color: 'from-blue-500 to-blue-600', pct: 100 },
  { name: 'Qualified', count: 8, value: 520000, color: 'from-cyan-500 to-cyan-600', pct: 67 },
  { name: 'Demo', count: 7, value: 480000, color: 'from-purple-500 to-purple-600', pct: 58 },
  { name: 'Proposal', count: 5, value: 390000, color: 'from-orange-500 to-orange-600', pct: 42 },
  { name: 'Negotiation', count: 4, value: 670000, color: 'from-pink-500 to-pink-600', pct: 33 },
];

const PIPELINE_DEALS = [
  { company: 'Vertex AI', contact: 'Marcus Chen', value: 120000, stage: 'Proposal', owner: 'SK', probability: 72, close: 'Feb 28', color: 'orange' as const },
  { company: 'NovaTech', contact: 'James Liu', value: 150000, stage: 'Negotiation', owner: 'VM', probability: 65, close: 'Feb 21', color: 'purple' as const },
  { company: 'CloudNine', contact: 'David Park', value: 96000, stage: 'Demo', owner: 'AJ', probability: 45, close: 'Mar 15', color: 'blue' as const },
  { company: 'DataFlow', contact: 'Emma Wilson', value: 67000, stage: 'Qualified', owner: 'SK', probability: 35, close: 'Mar 30', color: 'green' as const },
  { company: 'Acme Corp', contact: 'Sarah Kim', value: 84000, stage: 'Negotiation', owner: 'VM', probability: 88, close: 'Feb 14', color: 'purple' as const },
  { company: 'Quantum Labs', contact: 'Priya Patel', value: 210000, stage: 'Demo', owner: 'AJ', probability: 30, close: 'Apr 10', color: 'blue' as const },
  { company: 'ScaleUp Inc', contact: 'Tom Harris', value: 45000, stage: 'Qualified', owner: 'SK', probability: 50, close: 'Mar 20', color: 'green' as const },
  { company: 'ByteStream', contact: 'Lena Sørensen', value: 78000, stage: 'Proposal', owner: 'VM', probability: 60, close: 'Mar 5', color: 'orange' as const },
];

const WORKFLOWS = [
  {
    name: 'Enterprise Outreach Sequence',
    description: 'Automated 14-day outreach for enterprise leads',
    status: 'active' as const,
    enrolled: 234,
    completed: 189,
    conversion: 18.4,
    steps: [
      { type: 'email', label: 'Intro Email' },
      { type: 'wait', label: '3 days' },
      { type: 'email', label: 'Value Prop' },
      { type: 'wait', label: '2 days' },
      { type: 'call', label: 'Follow-up' },
    ],
  },
  {
    name: 'Demo Follow-up',
    description: 'Post-demo nurture sequence with proposal',
    status: 'active' as const,
    enrolled: 87,
    completed: 64,
    conversion: 31.2,
    steps: [
      { type: 'email', label: 'Thank You' },
      { type: 'wait', label: '1 day' },
      { type: 'email', label: 'Resources' },
      { type: 'wait', label: '3 days' },
      { type: 'email', label: 'Proposal' },
    ],
  },
  {
    name: 'Win-Back Campaign',
    description: 'Re-engage churned accounts with new offers',
    status: 'paused' as const,
    enrolled: 156,
    completed: 98,
    conversion: 8.7,
    steps: [
      { type: 'email', label: 'We Miss You' },
      { type: 'wait', label: '5 days' },
      { type: 'email', label: 'New Features' },
      { type: 'wait', label: '7 days' },
      { type: 'call', label: 'Personal' },
    ],
  },
];

const CRM_NOTIFICATIONS = [
  { text: 'Deal closed: Acme Corp — $84K ARR', time: '2m ago', icon: CheckCircle2, color: 'text-green-400', read: false },
  { text: 'New lead assigned: DataFlow Inc', time: '8m ago', icon: UserCheck, color: 'text-blue-400', read: false },
  { text: 'Meeting in 15 min: CloudNine discovery', time: '12m ago', icon: Calendar, color: 'text-purple-400', read: false },
  { text: 'Proposal viewed by Vertex AI', time: '1h ago', icon: ArrowUpRight, color: 'text-orange-400', read: true },
  { text: 'Weekly pipeline report ready', time: '3h ago', icon: Activity, color: 'text-gray-400', read: true },
];

const ANALYTICS_KPIS = [
  { label: 'ARR', value: 1530000, prefix: '$', suffix: '', trend: +32.4, icon: DollarSign, color: 'blue' },
  { label: 'Net Revenue Retention', value: 118, prefix: '', suffix: '%', trend: +6.2, icon: TrendingUp, color: 'green' },
  { label: 'LTV', value: 18400, prefix: '$', suffix: '', trend: +12.8, icon: Target, color: 'purple' },
  { label: 'Churn Rate', value: 1.8, prefix: '', suffix: '%', trend: -0.4, icon: Activity, color: 'emerald' },
];

const COHORT_DATA = [
  { cohort: 'Oct 2025', months: [100, 94, 88, 85, 82, 80] },
  { cohort: 'Nov 2025', months: [100, 92, 86, 83, 81, null] },
  { cohort: 'Dec 2025', months: [100, 96, 91, 88, null, null] },
  { cohort: 'Jan 2026', months: [100, 95, 90, null, null, null] },
];

// ============================================================
// HOOKS & UTILITIES
// ============================================================

function useCountUp(end: number, duration = 1500): number {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>();

  useEffect(() => {
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setCurrent(Math.round(ease(progress) * end));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [end, duration]);

  return current;
}

function formatNumber(n: number, prefix = '', suffix = ''): string {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M${suffix}`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(n % 1000 === 0 ? 0 : 1)}K${suffix}`;
  return `${prefix}${n.toLocaleString()}${suffix}`;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================

const Card = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`bg-[#111111] rounded-[2rem] p-6 border border-[#222] hover:border-[#333] transition-colors ${className}`} style={style}>
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

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'emerald' | 'cyan' | 'pink' }) => {
  const styles: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wide ${styles[color] || styles.blue}`}>
      {children}
    </span>
  );
};

const MiniSparkline = ({ data, color = '#818cf8' }: { data: number[]; color?: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 56},${20 - ((v - min) / range) * 16}`).join(' ');
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" className="opacity-60" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

const AnimatedKPI = ({ kpi, index }: { kpi: typeof KPI_DATA[number]; index: number }) => {
  const count = useCountUp(kpi.value);
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    green: 'bg-green-500/10 text-green-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  };
  const sparkColorMap: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    green: '#22c55e',
    emerald: '#34d399',
  };
  const isPositive = kpi.trend > 0;
  const isCAC = kpi.label === 'CAC';
  const trendGood = isCAC ? !isPositive : isPositive;

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorMap[kpi.color]}`}>
          <kpi.icon size={18} aria-hidden="true" />
        </div>
        <MiniSparkline data={kpi.sparkline} color={sparkColorMap[kpi.color]} />
      </div>
      <div className="text-2xl font-mono font-bold text-white mb-1">
        {formatNumber(count, kpi.prefix, kpi.suffix)}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{kpi.label}</span>
        <span className={`text-[10px] font-mono flex items-center gap-1 ${trendGood ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={10} aria-hidden="true" /> : <TrendingDown size={10} aria-hidden="true" />}
          {isPositive ? '+' : ''}{kpi.trend}%
        </span>
      </div>
    </Card>
  );
};

// ============================================================
// CHARTS
// ============================================================

const RevenueChart = () => {
  const maxVal = Math.max(...MRR_DATA.map(d => d.value));
  const h = 160;
  const w = 500;
  const padX = 0;
  const padY = 10;

  const points = MRR_DATA.map((d, i) => {
    const x = padX + (i / (MRR_DATA.length - 1)) * (w - padX * 2);
    const y = padY + (1 - d.value / maxVal) * (h - padY * 2);
    return { x, y };
  });

  const pathD = points.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = prev.x + (p.x - prev.x) * 0.6;
    return `C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
  }).join(' ');

  const areaD = `${pathD} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
  const totalLength = 800;

  return (
    <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
          <p className="text-xs text-gray-500">Monthly Recurring Revenue (12 months)</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-mono flex items-center gap-1">
          <TrendingUp size={12} aria-hidden="true" /> +105%
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full" preserveAspectRatio="none" role="img" aria-label="Revenue growth chart showing MRR from $62K to $127K over 12 months">
          <defs>
            <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line key={i} x1={0} x2={w} y1={padY + frac * (h - padY * 2)} y2={padY + frac * (h - padY * 2)} stroke="#222" strokeWidth="1" />
          ))}
          {/* Area */}
          <path d={areaD} fill="url(#revGrad)" />
          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={totalLength}
            strokeDashoffset={totalLength}
            className="animate-draw-line"
          />
          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" stroke="#111" strokeWidth="2" className="animate-scale-in" style={{ animationDelay: `${600 + i * 60}ms` }} />
          ))}
          {/* Month labels */}
          {MRR_DATA.map((d, i) => (
            <text key={i} x={padX + (i / (MRR_DATA.length - 1)) * (w - padX * 2)} y={h + 20} textAnchor="middle" className="fill-gray-500 text-[10px] font-mono">
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    </Card>
  );
};

const RevenueBarChart = () => {
  const maxVal = Math.max(...MRR_DATA.map(d => d.value));
  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Monthly Revenue</h3>
          <p className="text-xs text-gray-500">MRR trend by month</p>
        </div>
        <div className="flex bg-[#0a0a0a] p-1 rounded-lg border border-[#222]">
          <button className="px-3 py-1 text-[10px] font-bold bg-[#222] text-white rounded shadow">12M</button>
          <button className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">6M</button>
          <button className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">3M</button>
        </div>
      </div>
      <div className="flex items-end justify-between h-40 gap-1.5" role="img" aria-label="Monthly revenue bar chart">
        {MRR_DATA.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2 group w-full">
            <div className="relative w-full rounded-t-md bg-[#1a1a1a] h-32 overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md animate-fill-bar"
                style={{ '--bar-width': `${(d.value / maxVal) * 100}%`, height: `${(d.value / maxVal) * 100}%`, animationDelay: `${i * 80}ms` } as React.CSSProperties}
              />
            </div>
            <span className="text-[9px] text-gray-500 font-mono">{d.month}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CohortHeatmap = () => {
  const getColor = (v: number | null) => {
    if (v === null) return 'bg-[#1a1a1a]';
    if (v >= 95) return 'bg-green-500/80';
    if (v >= 90) return 'bg-green-500/60';
    if (v >= 85) return 'bg-green-500/40';
    if (v >= 80) return 'bg-green-500/20';
    return 'bg-green-500/10';
  };

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <h3 className="text-lg font-bold text-white mb-1">Cohort Retention</h3>
      <p className="text-xs text-gray-500 mb-4">Revenue retention by monthly cohort</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th scope="col" className="text-left text-gray-500 font-mono pb-2 pr-4">Cohort</th>
              {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map(m => (
                <th key={m} scope="col" className="text-center text-gray-500 font-mono pb-2 px-1">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COHORT_DATA.map((row, ri) => (
              <tr key={ri}>
                <td className="text-gray-400 font-mono py-1 pr-4 whitespace-nowrap">{row.cohort}</td>
                {row.months.map((val, ci) => (
                  <td key={ci} className="py-1 px-1">
                    <div
                      className={`w-full h-8 rounded flex items-center justify-center font-mono text-[10px] animate-fade-in-up ${getColor(val)} ${val !== null ? 'text-white' : 'text-gray-600'}`}
                      style={{ animationDelay: `${600 + ri * 80 + ci * 40}ms` }}
                    >
                      {val !== null ? `${val}%` : '—'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const RevenueDonut = () => {
  const segments = [
    { label: 'New Business', pct: 45, color: '#3b82f6', offset: 0 },
    { label: 'Expansion', pct: 30, color: '#a855f7', offset: -45 },
    { label: 'Renewal', pct: 20, color: '#22c55e', offset: -75 },
    { label: 'Services', pct: 5, color: '#f97316', offset: -95 },
  ];

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
      <h3 className="text-lg font-bold text-white mb-1">Revenue by Source</h3>
      <p className="text-xs text-gray-500 mb-4">Distribution of revenue streams</p>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" role="img" aria-label="Revenue breakdown: New Business 45%, Expansion 30%, Renewal 20%, Services 5%">
            <path className="text-[#222]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="5" />
            {segments.map((s, i) => (
              <path
                key={i}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={s.color}
                strokeWidth="5"
                strokeDasharray={`${s.pct}, 100`}
                strokeDashoffset={s.offset}
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
        <div className="space-y-2 flex-1">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-gray-400">{s.label}</span>
              </div>
              <span className="font-mono text-white">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// ============================================================
// WORKFLOW COMPONENTS
// ============================================================

const FlowNode = ({ type, label }: { type: string; label: string }) => {
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

const FlowConnector = ({ active }: { active: boolean }) => (
  <div className="flex items-center px-1">
    <div className={`w-6 h-0.5 ${active ? 'bg-blue-500/50' : 'bg-gray-700'}`} />
    <div className={`w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ${active ? 'border-l-[5px] border-l-blue-500/50' : 'border-l-[5px] border-l-gray-700'}`} />
  </div>
);

// ============================================================
// SUB-VIEWS
// ============================================================

const DashboardView = () => (
  <div className="space-y-6">
    {/* KPI Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_DATA.map((kpi, i) => (
        <AnimatedKPI key={kpi.label} kpi={kpi} index={i} />
      ))}
    </div>

    {/* Revenue Chart + Activity Feed */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <RevenueChart />

      <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Live Activity</h3>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono text-green-400 uppercase">Live</span>
          </span>
        </div>
        <div className="space-y-3">
          {ACTIVITIES.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${i === 0 ? 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent bg-[length:200%_100%] animate-shimmer' : 'hover:bg-[#1a1a1a]'}`}
            >
              <div className={`mt-0.5 ${a.color}`}>
                <a.icon size={14} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{a.action}</div>
                <div className="text-[10px] text-gray-500 truncate">{a.detail}</div>
              </div>
              <span className="text-[9px] text-gray-600 font-mono whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Deals Table + Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="flex justify-between items-center p-6 pb-0">
          <h3 className="text-sm font-bold text-white">Top Pipeline Deals</h3>
          <button className="text-[10px] text-blue-400 font-bold hover:text-blue-300">View all</button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left mt-4">
            <thead>
              <tr className="border-b border-[#222] text-[10px] text-gray-500 uppercase font-mono">
                <th scope="col" className="px-6 py-3 font-medium">Company</th>
                <th scope="col" className="px-6 py-3 font-medium">Value</th>
                <th scope="col" className="px-6 py-3 font-medium">Stage</th>
                <th scope="col" className="px-6 py-3 font-medium">Probability</th>
                <th scope="col" className="px-6 py-3 font-medium">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {TOP_DEALS.map((deal, i) => (
                <tr key={i} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                        {deal.company.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{deal.company}</div>
                        <div className="text-[10px] text-gray-500">{deal.contact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs font-mono text-white">{formatCurrency(deal.value)}</td>
                  <td className="px-6 py-3"><Badge color={deal.color}>{deal.stage}</Badge></td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <AnimatedBar width={deal.probability} color={deal.probability > 70 ? 'bg-green-500' : deal.probability > 50 ? 'bg-blue-500' : 'bg-orange-500'} delay={700 + i * 100} />
                      <span className="text-[10px] font-mono text-gray-400 w-8">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-[10px] text-gray-500 font-mono">{deal.close}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-[#222] bg-[#0a0a0a] flex justify-between text-xs">
          <span className="text-gray-500">Total Pipeline</span>
          <span className="font-mono font-bold text-white">{formatCurrency(TOP_DEALS.reduce((s, d) => s + d.value, 0))}</span>
        </div>
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Today&apos;s Actions</h3>
          <div className="w-5 h-5 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
            {TODAY_ACTIONS.filter(t => !t.overdue).length}
          </div>
        </div>
        <div className="space-y-2">
          {TODAY_ACTIONS.map((task, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${task.overdue ? 'border-red-500/20 bg-red-500/5 animate-pulse-glow' : 'border-[#222] hover:border-[#333]'}`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${task.overdue ? 'border-red-500 text-red-500' : task.priority === 'high' ? 'border-orange-500' : 'border-[#333]'}`}>
                {task.overdue && <AlertCircle size={10} aria-hidden="true" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs ${task.overdue ? 'text-red-300' : 'text-gray-300'}`}>{task.text}</div>
                {task.overdue && <span className="text-[9px] text-red-400 font-mono uppercase">Overdue</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const PipelineView = () => {
  const totalPipeline = PIPELINE_DEALS.reduce((s, d) => s + d.value, 0);
  const weightedPipeline = PIPELINE_DEALS.reduce((s, d) => s + d.value * (d.probability / 100), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Sales Pipeline</h2>
          <p className="text-gray-500 text-sm">Active opportunities by stage</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold rounded-xl border border-[#333] hover:bg-[#222]">
            <Filter size={14} aria-hidden="true" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20">
            <Plus size={14} aria-hidden="true" /> New Deal
          </button>
        </div>
      </div>

      {/* Pipeline Stage Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage, i) => (
          <Card key={stage.name} className="p-4 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stage.color}`} />
            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-2">{stage.name}</div>
            <div className="text-xl font-mono font-bold text-white mb-0.5">{stage.count}</div>
            <div className="text-xs text-gray-400 font-mono mb-3">{formatCurrency(stage.value)}</div>
            <AnimatedBar width={stage.pct} color="bg-white/20" delay={200 + i * 80} />
          </Card>
        ))}
      </div>

      {/* Deals Table */}
      <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#222] text-[10px] text-gray-500 uppercase font-mono bg-[#0a0a0a]">
                <th scope="col" className="px-6 py-4 font-medium">Company</th>
                <th scope="col" className="px-6 py-4 font-medium">Contact</th>
                <th scope="col" className="px-6 py-4 font-medium">Value</th>
                <th scope="col" className="px-6 py-4 font-medium">Stage</th>
                <th scope="col" className="px-6 py-4 font-medium">Owner</th>
                <th scope="col" className="px-6 py-4 font-medium">Probability</th>
                <th scope="col" className="px-6 py-4 font-medium">Close Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {PIPELINE_DEALS.map((deal, i) => (
                <tr key={i} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">{deal.company.charAt(0)}</div>
                      <span className="text-xs font-bold text-white">{deal.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-gray-400">{deal.contact}</td>
                  <td className="px-6 py-3.5 text-xs font-mono font-bold text-white">{formatCurrency(deal.value)}</td>
                  <td className="px-6 py-3.5"><Badge color={deal.color}>{deal.stage}</Badge></td>
                  <td className="px-6 py-3.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[9px] font-bold border border-white/10">{deal.owner}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2 w-24">
                      <AnimatedBar width={deal.probability} color={deal.probability > 70 ? 'bg-green-500' : deal.probability > 50 ? 'bg-blue-500' : 'bg-orange-500'} delay={600 + i * 80} />
                      <span className="text-[10px] font-mono text-gray-400">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[10px] text-gray-500 font-mono">{deal.close}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#222] bg-[#0a0a0a] flex justify-between items-center">
          <div className="flex gap-6">
            <div>
              <span className="text-[10px] text-gray-500 uppercase">Total Pipeline</span>
              <div className="text-sm font-mono font-bold text-white">{formatCurrency(totalPipeline)}</div>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase">Weighted</span>
              <div className="text-sm font-mono font-bold text-green-400">{formatCurrency(Math.round(weightedPipeline))}</div>
            </div>
          </div>
          <span className="text-[10px] text-gray-500">{PIPELINE_DEALS.length} active deals</span>
        </div>
      </Card>
    </div>
  );
};

const WorkflowsView = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Workflows</h2>
        <p className="text-gray-500 text-sm">Automated sequences and campaigns</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20">
        <Plus size={14} aria-hidden="true" /> New Workflow
      </button>
    </div>

    {/* Automation KPIs */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

const AnalyticsView = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
        <p className="text-gray-500 text-sm">Revenue metrics and growth indicators</p>
      </div>
      <div className="flex bg-[#111] p-1 rounded-xl border border-[#222]">
        <button className="px-4 py-1.5 text-xs font-bold bg-[#222] text-white rounded-lg shadow">12M</button>
        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">6M</button>
        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">QTD</button>
      </div>
    </div>

    {/* Analytics KPIs */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {ANALYTICS_KPIS.map((kpi, i) => {
        const colorMap: Record<string, string> = {
          blue: 'bg-blue-500/10 text-blue-400',
          green: 'bg-green-500/10 text-green-400',
          purple: 'bg-purple-500/10 text-purple-400',
          emerald: 'bg-emerald-500/10 text-emerald-400',
        };
        const isChurn = kpi.label === 'Churn Rate';
        const trendGood = isChurn ? kpi.trend < 0 : kpi.trend > 0;
        return (
          <Card key={kpi.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorMap[kpi.color]}`}>
                <kpi.icon size={16} aria-hidden="true" />
              </div>
              <span className={`text-[10px] font-mono ${trendGood ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-white">{formatNumber(kpi.value, kpi.prefix, kpi.suffix)}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</div>
          </Card>
        );
      })}
    </div>

    {/* Revenue Bar Chart */}
    <RevenueBarChart />

    {/* Cohort + Donut */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CohortHeatmap />
      <RevenueDonut />
    </div>
  </div>
);

const SETTINGS_TABS = ['General', 'Notifications', 'Pipeline Stages', 'Billing & Plans', 'Team', 'Integrations'] as const;

const INITIAL_INTEGRATIONS = [
  { name: 'Slack', connected: true },
  { name: 'HubSpot', connected: true },
  { name: 'Salesforce', connected: false },
  { name: 'Stripe', connected: true },
];

const INITIAL_TOGGLES = [
  { id: 'toggle-darkmode', label: 'Dark Mode', desc: 'System default is active', checked: true },
  { id: 'toggle-email', label: 'Email Notifications', desc: 'Receive weekly digests', checked: false },
  { id: 'toggle-public', label: 'Public Profile', desc: 'Visible to search engines', checked: true },
];

const NOTIFICATION_TOGGLES = [
  { id: 'notif-deals', label: 'Deal Updates', desc: 'When a deal changes stage or value', checked: true },
  { id: 'notif-assignments', label: 'Lead Assignments', desc: 'When a new lead is assigned to you', checked: true },
  { id: 'notif-meetings', label: 'Meeting Reminders', desc: '15 minutes before scheduled meetings', checked: true },
  { id: 'notif-reports', label: 'Weekly Reports', desc: 'Pipeline and revenue summary every Monday', checked: false },
  { id: 'notif-workflows', label: 'Workflow Alerts', desc: 'When automation sequences complete', checked: false },
];

const PIPELINE_STAGE_CONFIG = [
  { name: 'New Lead', color: 'bg-blue-500', probability: 10 },
  { name: 'Qualified', color: 'bg-cyan-500', probability: 25 },
  { name: 'Demo Scheduled', color: 'bg-purple-500', probability: 40 },
  { name: 'Proposal Sent', color: 'bg-orange-500', probability: 60 },
  { name: 'Negotiation', color: 'bg-pink-500', probability: 80 },
  { name: 'Closed Won', color: 'bg-green-500', probability: 100 },
];

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ firstName: 'Velimir', lastName: 'Müller', role: 'Head of Revenue', email: 'velimir@crmpro.io' });
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);
  const [notifToggles, setNotifToggles] = useState(NOTIFICATION_TOGGLES);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setToggles(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const handleNotifToggle = (id: string) => {
    setNotifToggles(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const handleConnect = (name: string) => {
    setIntegrations(prev => prev.map(i => i.name === name ? { ...i, connected: !i.connected } : i));
  };

  const handleSave = () => {
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // General
        return (
          <>
            <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Profile Info</h3>
                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`text-xs font-bold transition-colors ${isEditing ? 'text-green-400 hover:text-green-300' : 'text-blue-400 hover:text-blue-300'}`}>
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border-4 border-[#111] relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Velimir" alt="Avatar" className="w-full h-full rounded-full" />
                  <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white border-2 border-[#111]" aria-label="Change profile picture">
                    <Edit3 size={12} aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="settings-firstname" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                      <input id="settings-firstname" type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
                    </div>
                    <div>
                      <label htmlFor="settings-lastname" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                      <input id="settings-lastname" type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="settings-email" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <input id="settings-email" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
                  </div>
                  <div>
                    <label htmlFor="settings-role" className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Role</label>
                    <input id="settings-role" type="text" value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} readOnly={!isEditing} className={`w-full bg-[#050505] border rounded px-3 py-2 text-sm text-gray-300 focus:outline-none transition-colors ${isEditing ? 'border-blue-500/50 focus:border-blue-500' : 'border-[#222]'}`} />
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
                  <div key={toggle.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white" id={toggle.id}>{toggle.label}</div>
                      <div className="text-xs text-gray-500">{toggle.desc}</div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={toggle.checked}
                      aria-labelledby={toggle.id}
                      onClick={() => handleToggle(toggle.id)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${toggle.checked ? 'bg-blue-600' : 'bg-[#222] border border-[#333]'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${toggle.checked ? 'right-1 bg-white' : 'left-1 bg-gray-500'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </>
        );

      case 1: // Notifications
        return (
          <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-base font-bold text-white mb-2">Notification Preferences</h3>
            <p className="text-xs text-gray-500 mb-6">Choose which notifications you&apos;d like to receive</p>
            <div className="space-y-5">
              {notifToggles.map((toggle) => (
                <div key={toggle.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white" id={toggle.id}>{toggle.label}</div>
                    <div className="text-xs text-gray-500">{toggle.desc}</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={toggle.checked}
                    aria-labelledby={toggle.id}
                    onClick={() => handleNotifToggle(toggle.id)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${toggle.checked ? 'bg-blue-600' : 'bg-[#222] border border-[#333]'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${toggle.checked ? 'right-1 bg-white' : 'left-1 bg-gray-500'}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );

      case 2: // Pipeline Stages
        return (
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
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] animate-fade-in-up" style={{ animationDelay: `${150 + i * 60}ms` }}>
                  <div className="flex items-center gap-2 w-6 text-gray-600 cursor-grab">
                    <MoreHorizontal size={14} aria-hidden="true" />
                  </div>
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="text-xs font-bold text-white flex-1">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500">Win prob:</span>
                    <span className="text-[10px] font-mono text-white bg-[#1a1a1a] px-2 py-0.5 rounded">{stage.probability}%</span>
                  </div>
                  <button className="text-gray-600 hover:text-white transition-colors p-1" aria-label={`Edit ${stage.name} stage`}>
                    <Edit3 size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );

      case 3: // Billing & Plans
        return (
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
                  <div key={i} className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
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

      case 4: // Team
        return (
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
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] animate-fade-in-up" style={{ animationDelay: `${150 + i * 80}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[10px] font-bold border border-white/10">{member.initials}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${member.online ? 'bg-green-500' : 'bg-gray-600'}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{member.name}</div>
                      <div className="text-[10px] text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={i === 0 ? 'purple' : 'blue'}>{member.role}</Badge>
                    <span className={`text-[9px] font-mono uppercase ${member.online ? 'text-green-400' : 'text-gray-600'}`}>{member.online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );

      case 5: // Integrations
        return (
          <Card className="p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-base font-bold text-white mb-2">Integrations</h3>
            <p className="text-xs text-gray-500 mb-6">Connect your favorite tools to CRMPro</p>
            <div className="space-y-3">
              {integrations.map((int, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] animate-fade-in-up" style={{ animationDelay: `${150 + i * 80}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center border border-[#222]">
                      <Building2 size={16} className="text-gray-400" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white">{int.name}</span>
                      <div className="text-[10px] text-gray-500">{int.connected ? 'Syncing data in real-time' : 'Not connected'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnect(int.name)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${int.connected ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                  >
                    {int.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

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
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// NOTIFICATION DROPDOWN
// ============================================================

const CRMNotificationDropdown = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-[#111] border border-[#222] rounded-2xl shadow-2xl shadow-black/50 z-50 animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
          <span className="text-xs font-bold text-white">Notifications</span>
          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">{CRM_NOTIFICATIONS.filter(n => !n.read).length} new</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {CRM_NOTIFICATIONS.map((n, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 border-b border-[#222]/50 hover:bg-[#1a1a1a] transition-colors ${!n.read ? 'bg-blue-500/[0.02]' : ''}`}>
              <div className={`mt-0.5 ${n.color}`}>
                <n.icon size={14} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] leading-relaxed ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.text}</div>
                <span className="text-[9px] text-gray-600 font-mono">{n.time}</span>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-[#222]">
          <button className="text-[10px] text-blue-400 font-bold hover:text-blue-300 w-full text-center">Mark all as read</button>
        </div>
      </div>
    </>
  );
};

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function DashboardDemoPage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'pipeline': return <PipelineView />;
      case 'workflows': return <WorkflowsView />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'pipeline': return 'Sales Pipeline';
      case 'workflows': return 'Workflows';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#E2E2E2] font-sans overflow-hidden">

      {/* --- Sidebar --- */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside aria-label="Dashboard sidebar navigation" className={`${sidebarOpen ? 'flex fixed inset-y-0 left-0 z-40 w-64' : 'hidden'} md:flex md:relative md:w-64 flex-shrink-0 border-r border-[#222] flex-col justify-between p-4 bg-[#050505]`}>
        <div>
          <div className="flex items-center gap-3 px-4 mb-12 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
              C
            </div>
            <span className="font-bold text-xl tracking-tight hidden md:block">CRM<span className="text-gray-600">Pro</span></span>
          </div>

          <div className="space-y-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={Users} label="Pipeline" id="pipeline" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={Workflow} label="Workflows" id="workflows" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={BarChart3} label="Analytics" id="analytics" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
            <NavItem icon={Settings} label="Settings" id="settings" activeId={activeView} onClick={(id) => { setActiveView(id); setSidebarOpen(false); }} />
          </div>
        </div>

        <div>
          <div className="bg-[#111] rounded-2xl p-4 mb-4 border border-[#222] animate-pulse-glow">
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

        <header className="h-20 border-b border-[#222] flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur z-20 shrink-0">
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
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Velimir" alt="User" className="w-full h-full rounded-full" />
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}
