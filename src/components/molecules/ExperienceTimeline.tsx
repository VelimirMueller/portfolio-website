import React from 'react';
import { glassCard } from './GlassPanel';

export type ExperienceEntry = {
  /** Stable key, e.g. `exp1`. */
  id: string;
  title: string;
  tag: string;
  company: string;
  date: string;
  desc: string;
};

type ExperienceTimelineProps = {
  /** Newest first. The first entry is the current role. */
  entries: ExperienceEntry[];
  /** Badge text for the current role. */
  currentLabel: string;
  className?: string;
};

/**
 * Experience log as a timeline in the glass look (vm-brand B-48). Put it in a GlassPanel.
 * Desktop: a centre line, entries alternate left and right. Mobile: the line sits left, cards sit right.
 * The node ring uses the glass panel tone, so it cuts the line without a white halo in dark mode.
 */
export const ExperienceTimeline = ({ entries, currentLabel, className = '' }: ExperienceTimelineProps) => (
  <ol
    className={`relative space-y-6 sm:space-y-8 before:absolute before:inset-y-0 before:left-5 before:-translate-x-1/2 md:before:left-1/2 before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-500/40 before:to-transparent ${className}`}
  >
    {entries.map((entry, i) => {
      const current = i === 0;
      return (
        <li
          key={entry.id}
          aria-current={current ? 'true' : undefined}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
        >
          <div
            aria-hidden="true"
            data-testid="timeline-node"
            className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 border border-brand-500/30 dark:border-brand-400/30 bg-zinc-50 dark:bg-[#0c0c10] shadow-[0_0_0_6px_rgba(255,255,255,0.58)] dark:shadow-[0_0_0_6px_rgba(12,12,16,0.85)]"
          >
            {current ? (
              <span className="relative flex w-3 h-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500/50 dark:bg-brand-400/50" />
            )}
          </div>
          <div
            className={`${glassCard} w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] min-w-0 p-4 sm:p-6 transition-colors hover:border-brand-500/40 dark:hover:border-brand-400/40`}
          >
            <div className="relative flex flex-wrap justify-between items-center mb-1 gap-y-1 gap-x-3">
              <h3 className="font-bold text-black dark:text-white text-lg min-w-0">{entry.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-zinc-500">{entry.tag}</span>
                {current && (
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {currentLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="relative text-xs font-mono text-brand-600 dark:text-brand-400 mb-1">{entry.company}</div>
            <time className="relative block mb-2 text-xs font-mono text-zinc-500 uppercase">{entry.date}</time>
            <p className="relative text-zinc-600 dark:text-zinc-400 text-sm">{entry.desc}</p>
          </div>
        </li>
      );
    })}
  </ol>
);
