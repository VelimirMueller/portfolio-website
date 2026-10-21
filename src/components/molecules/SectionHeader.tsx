import React from 'react';
import { ArtBackdrop } from '@/components/atoms/ArtBackdrop';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  /** Optional ArtBackdrop classes: decorative brand art behind the right side of the header. */
  artClassName?: string;
}

export const SectionHeader = ({ title, subtitle, artClassName }: SectionHeaderProps) => (
  <div className={`mb-10 md:mb-16 ${artClassName ? 'relative' : ''}`}>
    {artClassName && <ArtBackdrop className={artClassName} />}
    <div className="relative flex items-center gap-2.5 mb-4">
      <span className="text-brand-600 dark:text-brand-400 font-mono text-xs tracking-wider dark:opacity-70">01</span>
      <div className="h-px w-6 bg-brand-500/50"></div>
      <span className="text-brand-600 dark:text-brand-400 font-mono text-xs uppercase tracking-widest">{subtitle}</span>
    </div>
    <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-black dark:text-white leading-[0.9] md:leading-none">
      {title}
    </h1>
  </div>
);
