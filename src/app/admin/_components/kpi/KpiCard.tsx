'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Boxes,
  CalendarDays,
  Clock,
  Copy,
  Database,
  FlaskConical,
  History,
  Inbox,
  Languages,
  Layers,
  Library,
  ListPlus,
  Mail,
  Send,
  Server,
  ShieldAlert,
  Star,
  Table,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

const ICONS = {
  inbox: Inbox,
  mail: Mail,
  shield: ShieldAlert,
  calendar: CalendarDays,
  database: Database,
  activity: Activity,
  server: Server,
  table: Table,
  boxes: Boxes,
  layers: Layers,
  copy: Copy,
  languages: Languages,
  star: Star,
  listPlus: ListPlus,
  library: Library,
  flask: FlaskConical,
  send: Send,
  clock: Clock,
  history: History,
} as const;
const COLORS = {
  blue: { chip: 'bg-blue-500/10 text-blue-400', spark: '#3b82f6' },
  purple: { chip: 'bg-purple-500/10 text-purple-400', spark: '#a855f7' },
  green: { chip: 'bg-green-500/10 text-green-400', spark: '#22c55e' },
  red: { chip: 'bg-red-500/10 text-red-400', spark: '#f87171' },
  indigo: { chip: 'bg-brand-500/15 text-brand-400', spark: '#6366f1' },
} as const;

/** easeOutCubic count-up, as in the CRM demo's KPI cards. Decimals are kept. */
function useCountUp(end: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      setCurrent((1 - Math.pow(1 - p, 3)) * end);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [end, duration]);
  return current;
}

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / Math.max(data.length - 1, 1)) * 56},${20 - (v / max) * 16}`).join(' ');
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" className="opacity-60" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export interface KpiCardProps {
  label: string;
  /** Numeric value with count-up; optional when `display` is given. */
  value?: number;
  /** Ready-made value text (e.g. "2.4 GB", "17.2") shown instead of the number. */
  display?: string;
  suffix?: string;
  decimals?: number;
  icon: keyof typeof ICONS;
  color: keyof typeof COLORS;
  /** Percent change; positive is shown green unless `lowerIsBetter`. */
  trend?: number | null;
  trendLabel?: string;
  lowerIsBetter?: boolean;
  sparkline?: number[];
  index?: number;
}

export function KpiCard({
  label,
  value = 0,
  display,
  suffix = '',
  decimals = 0,
  icon,
  color,
  trend = null,
  trendLabel,
  lowerIsBetter = false,
  sparkline,
  index = 0,
}: KpiCardProps) {
  const Icon = ICONS[icon];
  const shown = useCountUp(value);
  const good = trend === null ? null : lowerIsBetter ? trend <= 0 : trend >= 0;

  return (
    <div
      className="bg-[#111111] rounded-[2rem] p-6 border border-[#222] hover:border-[#333] transition-colors animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${COLORS[color].chip}`}>
          <Icon size={18} aria-hidden="true" />
        </div>
        {sparkline && <Sparkline data={sparkline} color={COLORS[color].spark} />}
      </div>
      <div className="text-2xl font-mono font-bold text-white mb-1">
        {display ?? `${shown.toFixed(decimals)}${suffix}`}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">{label}</span>
        {trend !== null ? (
          <span className={`text-[10px] font-mono flex items-center gap-1 ${good ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={10} aria-hidden="true" /> : <TrendingDown size={10} aria-hidden="true" />}
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        ) : (
          trendLabel && <span className="text-[10px] font-mono text-gray-500">{trendLabel}</span>
        )}
      </div>
    </div>
  );
}
