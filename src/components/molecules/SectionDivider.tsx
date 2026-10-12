import React from 'react';
import { AnimateIn } from '@/components/atoms/AnimateIn';

const STRIP: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-[url('/art/v2/strip-flagship-1.webp')]",
  2: "bg-[url('/art/v2/strip-flagship-2.webp')]",
  3: "bg-[url('/art/v2/strip-flagship-3.webp')]",
  4: "bg-[url('/art/v2/strip-flagship-4.webp')]",
  5: "bg-[url('/art/v2/strip-flagship-5.webp')]",
};

type SectionDividerProps = {
  /** Anchor id for in-page links. */
  id?: string;
  index: string;
  total: number;
  title: string;
  caption: string;
  /** Word before the counter, e.g. "Section". */
  countLabel: string;
  /** strip-flagship-N art. */
  strip: 1 | 2 | 3 | 4 | 5;
  /** Heading level. Default h2. */
  as?: 'h2' | 'h3';
  className?: string;
};

/** Numbered art divider (signature mark `NN / TITLE`): always on the dark plate, in both modes. */
export const SectionDivider = ({ id, index, total, title, caption, countLabel, strip, as: H = 'h2', className = 'mt-24 md:mt-32 mb-6' }: SectionDividerProps) => (
  <AnimateIn from="bottom" className={className}>
    <div id={id} className="relative h-40 md:h-[200px] rounded-[1.5rem] overflow-hidden border border-light-border dark:border-[#26262b] bg-[#08080a] scroll-mt-28">
      <div aria-hidden="true" className={`absolute inset-0 bg-cover bg-center ${STRIP[strip]}`} />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,11,0.94),rgba(10,10,11,0.7)_40%,rgba(10,10,11,0.1)_72%,rgba(10,10,11,0.3))]" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-[3px] bg-brand-500/85" />
      <span className="absolute top-5 right-5 md:top-6 md:right-8 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 border border-[#26262b] bg-[#0a0a0b]/80 rounded-full px-3 py-1">
        {countLabel} {index} / {String(total).padStart(2, '0')}
      </span>
      <div className="relative h-full flex flex-col justify-center px-6 md:px-10">
        <H className="flex items-baseline gap-3 md:gap-4 font-mono font-bold tracking-tight">
          <span className="text-4xl md:text-6xl text-brand-400">{index}</span>
          <span className="text-2xl md:text-4xl text-zinc-500 font-normal">/</span>
          <span className="text-2xl md:text-5xl text-zinc-100 uppercase">{title}</span>
        </H>
        <div className="flex items-center gap-4 mt-3">
          <span aria-hidden="true" className="w-11 h-0.5 bg-brand-500" />
          <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.22em] text-zinc-400">{caption}</span>
        </div>
      </div>
    </div>
  </AnimateIn>
);
