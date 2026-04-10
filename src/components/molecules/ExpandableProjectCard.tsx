'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface Impact {
  value: string;
  label: string;
}

interface ExpandableProjectCardProps {
  title: string;
  category: string;
  techStack: string[];
  metricValue: string;
  metricLabel: string;
  challenge: string;
  solution: string;
  impacts: Impact[];
  demoHref: string;
  demoLabel: string;
  accentColor: 'blue' | 'emerald';
}

const accentClasses = {
  blue: {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    metric: 'text-blue-600 dark:text-blue-400',
    label: 'text-blue-600 dark:text-blue-400',
    impact: 'border-blue-500/10',
    link: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    metric: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-emerald-600 dark:text-emerald-400',
    impact: 'border-emerald-500/10',
    link: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function ExpandableProjectCard({
  title,
  category,
  techStack,
  metricValue,
  metricLabel,
  challenge,
  solution,
  impacts,
  demoHref,
  demoLabel,
  accentColor,
}: ExpandableProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const colors = accentClasses[accentColor];

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);

  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden transition-all duration-300 hover:border-black/20 dark:hover:border-white/20">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full p-5 md:p-6 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-black dark:text-white truncate">{title}</h3>
            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${colors.badge}`}>
              {category}
            </span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {techStack.map(tech => (
              <span key={tech} className="text-[11px] font-mono text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-[#050505] rounded border border-black/5 dark:border-white/5">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className={`text-xl font-bold ${colors.metric}`}>{metricValue}</span>
            <span className="text-xs text-gray-500 ml-1.5">{metricLabel}</span>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <div
        style={{ maxHeight: expanded ? contentHeight : 0 }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div ref={contentRef} className="border-t border-black/5 dark:border-white/5 p-5 md:p-6 bg-gray-50/50 dark:bg-[#0a0a0a]">
          {expanded && (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className={`text-[11px] font-mono uppercase tracking-wider mb-2 ${colors.label}`}>Challenge</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{challenge}</p>
                </div>
                <div>
                  <div className={`text-[11px] font-mono uppercase tracking-wider mb-2 ${colors.label}`}>Solution</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{solution}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {impacts.map(({ value, label }) => (
                  <div key={label} className={`flex-1 min-w-[120px] bg-white dark:bg-[#111] border ${colors.impact} border-black/5 dark:border-white/5 rounded-lg p-3 text-center`}>
                    <div className={`text-2xl font-bold ${colors.metric}`}>{value}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <Link
                href={demoHref}
                className={`inline-flex items-center gap-2 font-mono text-xs font-bold ${colors.link} hover:opacity-80 transition-opacity`}
              >
                {demoLabel} <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
