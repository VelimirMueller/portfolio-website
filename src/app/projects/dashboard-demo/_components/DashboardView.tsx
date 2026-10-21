import React from 'react';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { ACTIVITIES, KPI_DATA, TODAY_ACTIONS, TOP_DEALS } from '../_lib/data';
import { formatCurrency, formatNumber, isTrendGood, openActionCount, pipelineTotals, probabilityColor } from '../_lib/format';
import { useCountUp } from '../_lib/useCountUp';
import { RevenueChart } from './charts';
import { AnimatedBar, Badge, Card, MiniSparkline } from './ui';

export const AnimatedKPI = ({ kpi, index }: { kpi: typeof KPI_DATA[number]; index: number }) => {
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
  const trendGood = isTrendGood(kpi.trend, kpi.label === 'CAC');

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

export const DashboardView = () => (
  <div className="space-y-6">
    {/* KPI Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${i === 0 ? 'bg-linear-to-r from-blue-500/5 via-purple-500/5 to-transparent bg-size-[200%_100%] animate-shimmer' : 'hover:bg-[#1a1a1a]'}`}
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
        {/* Mobile card layout */}
        <div className="md:hidden p-4 space-y-3 mt-2">
          {TOP_DEALS.map((deal, i) => (
            <div key={i} className="p-3 rounded-xl glass-demo-inner border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                    {deal.company.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{deal.company}</div>
                    <div className="text-[10px] text-gray-500">{deal.contact}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white">{formatCurrency(deal.value)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge color={deal.color}>{deal.stage}</Badge>
                <div className="flex items-center gap-2">
                  <div className="w-16">
                    <AnimatedBar width={deal.probability} color={probabilityColor(deal.probability)} delay={700 + i * 100} />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{deal.probability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table layout */}
        <div className="w-full overflow-x-auto hidden md:block">
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
                      <div className="w-7 h-7 rounded-lg bg-linear-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">
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
                      <AnimatedBar width={deal.probability} color={probabilityColor(deal.probability)} delay={700 + i * 100} />
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
          <span className="font-mono font-bold text-white">{formatCurrency(pipelineTotals(TOP_DEALS).total)}</span>
        </div>
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Today&apos;s Actions</h3>
          <div className="w-5 h-5 rounded-sm bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
            {openActionCount(TODAY_ACTIONS)}
          </div>
        </div>
        <div className="space-y-2">
          {TODAY_ACTIONS.map((task, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${task.overdue ? 'border-red-500/20 bg-red-500/5 animate-pulse-glow' : 'border-[#222] hover:border-[#333]'}`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${task.overdue ? 'border-red-500 text-red-500' : task.priority === 'high' ? 'border-orange-500' : 'border-[#333]'}`}>
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
