import React from 'react';
import { TrendingUp } from 'lucide-react';
import { COHORT_DATA, MRR_DATA } from '../_lib/data';
import { cohortColor, revenueChartGeometry } from '../_lib/format';
import { Card } from './ui';

export const RevenueChart = () => {
  const h = 160;
  const w = 500;
  const padX = 0;
  const padY = 10;
  const { points, pathD, areaD } = revenueChartGeometry(MRR_DATA.map(d => d.value), { w, h, padX, padY });
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

export const RevenueBarChart = () => {
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

export const CohortHeatmap = () => {
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
                      className={`w-full h-8 rounded flex items-center justify-center font-mono text-[10px] animate-fade-in-up ${cohortColor(val)} ${val !== null ? 'text-white' : 'text-gray-600'}`}
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

export const RevenueDonut = () => {
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
