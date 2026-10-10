import React from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';

/** vm-brand groups: one accent each. Static class strings so Tailwind sees them. */
export type BuildGroup = 'flagship' | 'lab' | 'ops';

const groupStyle: Record<BuildGroup, { label: string; badge: string; line: string }> = {
  flagship: { label: 'Flagship', badge: 'text-[#4f46e5] dark:text-[#818cf8] border-[#6366f1]/30 bg-[#6366f1]/10', line: 'bg-[#6366f1]' },
  lab: { label: 'Lab', badge: 'text-[#7c3aed] dark:text-[#a78bfa] border-[#8b5cf6]/30 bg-[#8b5cf6]/10', line: 'bg-[#8b5cf6]' },
  ops: { label: 'Ops', badge: 'text-[#a21caf] dark:text-[#EE4FFF] border-[#EE4FFF]/30 bg-[#EE4FFF]/10', line: 'bg-[#EE4FFF]' },
};

interface BuildCardProps {
  group: BuildGroup;
  title: string;
  desc: string;
  /** Path under /public; dark brand render, shown in a window in both modes. */
  image: string;
  tags: string[];
  /** External link; without it the card says the repo is private. */
  href?: string;
  linkLabel?: string;
  privateLabel: string;
}

export const BuildCard = ({ group, title, desc, image, tags, href, linkLabel, privateLabel }: BuildCardProps) => {
  const g = groupStyle[group];
  return (
    <article className="h-full flex flex-col bg-white dark:bg-[#111] rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden hover:border-black/20 dark:hover:border-white/20 transition-colors">
      <div className="relative aspect-[2.4/1] bg-[#0a0a0b]">
        {/* Decorative render; the title carries the meaning. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute left-6 bottom-0 h-0.5 w-10 ${g.line}`} />
      </div>
      <div className="p-6 flex flex-col gap-4 flex-1">
        <span className={`w-fit px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest ${g.badge}`}>{g.label}</span>
        <h3 className="text-xl font-mono font-bold text-black dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1">{desc}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-[11px] font-mono text-gray-500 px-2.5 py-1 bg-gray-100 dark:bg-[#050505] rounded-md border border-black/5 dark:border-white/5">{tag}</span>
          ))}
        </div>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-black dark:text-white hover:underline w-fit">
            {linkLabel} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 w-fit">
            <Lock size={12} aria-hidden="true" /> {privateLabel}
          </span>
        )}
      </div>
    </article>
  );
};
