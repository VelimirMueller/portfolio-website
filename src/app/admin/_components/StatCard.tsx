'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Archive, CheckCircle2, Inbox, ShieldAlert, TrendingUp } from 'lucide-react';
import type { MessageStatus } from '../_lib/messages';

const META: Record<MessageStatus, { label: string; icon: typeof Inbox; chip: string; spark: string }> = {
  new: { label: 'Unread', icon: Inbox, chip: 'bg-blue-500/10 text-blue-400', spark: '#3b82f6' },
  read: { label: 'Read', icon: CheckCircle2, chip: 'bg-green-500/10 text-green-400', spark: '#22c55e' },
  archived: { label: 'Archived', icon: Archive, chip: 'bg-purple-500/10 text-purple-400', spark: '#a855f7' },
  spam: { label: 'Spam', icon: ShieldAlert, chip: 'bg-red-500/10 text-red-400', spark: '#f87171' },
};

/** easeOutCubic count-up, as in the demo's KPI cards. */
function useCountUp(end: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      setCurrent(Math.round((1 - Math.pow(1 - p, 3)) * end));
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
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 56},${20 - (v / max) * 16}`).join(' ');
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" className="opacity-60" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export function StatCard({
  status,
  count,
  daily,
  active,
  index,
}: {
  status: MessageStatus;
  count: number;
  daily: number[];
  active: boolean;
  index: number;
}) {
  const meta = META[status];
  const shown = useCountUp(count);
  const lastWeek = daily.slice(-7).reduce((a, b) => a + b, 0);

  return (
    <Link
      href={`/admin?status=${status}`}
      aria-current={active ? 'page' : undefined}
      className={`block bg-[#111111] rounded-[2rem] p-6 border transition-colors animate-fade-in-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        active ? 'border-blue-500/40 shadow-lg shadow-blue-900/20' : 'border-[#222] hover:border-[#333]'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${meta.chip}`}>
          <meta.icon size={18} aria-hidden="true" />
        </div>
        <Sparkline data={daily} color={meta.spark} />
      </div>
      <div className="text-2xl font-mono font-bold text-white mb-1">{shown}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{meta.label}</span>
        <span className="text-[10px] font-mono flex items-center gap-1 text-gray-400">
          <TrendingUp size={10} aria-hidden="true" />+{lastWeek} / 7d
        </span>
      </div>
    </Link>
  );
}
