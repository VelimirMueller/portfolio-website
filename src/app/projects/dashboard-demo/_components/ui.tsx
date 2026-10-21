import React from 'react';
import { sparklinePoints } from '../_lib/format';

export const Card = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`glass-demo rounded-4xl p-6 border hover:border-white/20 transition-colors ${className}`} style={style}>
    {children}
  </div>
);

export const NavItem = ({ icon: Icon, label, id, activeId, onClick }: { icon: React.ElementType; label: string; id: string; activeId: string; onClick: (id: string) => void }) => (
  <button
    onClick={() => onClick(id)}
    aria-current={activeId === id ? 'page' : undefined}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${activeId === id ? 'bg-blue-600/10 text-blue-400' : 'text-gray-500 hover:bg-[#1a1a1a] hover:text-white'}`}
  >
    <Icon size={20} aria-hidden="true" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'emerald' | 'cyan' | 'pink' }) => {
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

export const MiniSparkline = ({ data, color = '#818cf8' }: { data: number[]; color?: string }) => {
  const points = sparklinePoints(data);
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" className="opacity-60" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const AnimatedBar = ({ width, color = 'bg-blue-500', delay = 0 }: { width: number; color?: string; delay?: number }) => (
  <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full animate-fill-bar`}
      style={{ '--bar-width': `${width}%`, animationDelay: `${delay}ms` } as React.CSSProperties}
    />
  </div>
);
