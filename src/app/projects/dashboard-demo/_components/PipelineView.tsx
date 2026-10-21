import React from 'react';
import { Filter, Plus } from 'lucide-react';
import { PIPELINE_DEALS, PIPELINE_STAGES } from '../_lib/data';
import { formatCurrency, pipelineTotals, probabilityColor } from '../_lib/format';
import { AnimatedBar, Badge, Card } from './ui';

export const PipelineView = () => {
  const { total: totalPipeline, weighted: weightedPipeline } = pipelineTotals(PIPELINE_DEALS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage, i) => (
          <Card key={stage.name} className="p-4 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${stage.color}`} />
            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-2">{stage.name}</div>
            <div className="text-xl font-mono font-bold text-white mb-0.5">{stage.count}</div>
            <div className="text-xs text-gray-400 font-mono mb-3">{formatCurrency(stage.value)}</div>
            <AnimatedBar width={stage.pct} color="bg-white/20" delay={200 + i * 80} />
          </Card>
        ))}
      </div>

      {/* Deals Table */}
      <Card className="p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        {/* Mobile card layout */}
        <div className="md:hidden p-4 space-y-3">
          {PIPELINE_DEALS.map((deal, i) => (
            <div key={i} className="p-3 rounded-xl glass-demo-inner border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">{deal.company.charAt(0)}</div>
                  <div>
                    <div className="text-xs font-bold text-white">{deal.company}</div>
                    <div className="text-[10px] text-gray-500">{deal.contact}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white">{formatCurrency(deal.value)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Badge color={deal.color}>{deal.stage}</Badge>
                  <div className="w-5 h-5 rounded-full bg-linear-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[8px] font-bold border border-white/10">{deal.owner}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-14">
                    <AnimatedBar width={deal.probability} color={probabilityColor(deal.probability)} delay={600 + i * 80} />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{deal.probability}%</span>
                  <span className="text-[10px] text-gray-500 font-mono ml-1">{deal.close}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table layout */}
        <div className="w-full overflow-x-auto hidden md:block">
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
                      <div className="w-7 h-7 rounded-lg bg-linear-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">{deal.company.charAt(0)}</div>
                      <span className="text-xs font-bold text-white">{deal.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-gray-400">{deal.contact}</td>
                  <td className="px-6 py-3.5 text-xs font-mono font-bold text-white">{formatCurrency(deal.value)}</td>
                  <td className="px-6 py-3.5"><Badge color={deal.color}>{deal.stage}</Badge></td>
                  <td className="px-6 py-3.5">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[9px] font-bold border border-white/10">{deal.owner}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2 w-24">
                      <AnimatedBar width={deal.probability} color={probabilityColor(deal.probability)} delay={600 + i * 80} />
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
