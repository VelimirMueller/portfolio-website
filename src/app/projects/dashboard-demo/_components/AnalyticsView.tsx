import React from 'react';
import { ANALYTICS_KPIS } from '../_lib/data';
import { formatNumber, isTrendGood } from '../_lib/format';
import { CohortHeatmap, RevenueBarChart, RevenueDonut } from './charts';
import { Card } from './ui';

export const AnalyticsView = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
        <p className="text-gray-500 text-sm">Revenue metrics and growth indicators</p>
      </div>
      <div className="flex bg-[#111] p-1 rounded-xl border border-[#222] self-start sm:self-auto">
        <button className="px-4 py-1.5 text-xs font-bold bg-[#222] text-white rounded-lg shadow-sm">12M</button>
        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">6M</button>
        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-white transition-colors">QTD</button>
      </div>
    </div>

    {/* Analytics KPIs */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ANALYTICS_KPIS.map((kpi, i) => {
        const colorMap: Record<string, string> = {
          blue: 'bg-blue-500/10 text-blue-400',
          green: 'bg-green-500/10 text-green-400',
          purple: 'bg-purple-500/10 text-purple-400',
          emerald: 'bg-emerald-500/10 text-emerald-400',
        };
        const trendGood = isTrendGood(kpi.trend, kpi.label === 'Churn Rate');
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
