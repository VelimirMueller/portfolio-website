import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <div className="mb-10 md:mb-16">
    <div className="flex items-center gap-2.5 mb-4">
      <span className="text-green-600 dark:text-green-500 font-mono text-xs tracking-wider opacity-70">01</span>
      <div className="h-px w-6 bg-green-600/40 dark:bg-green-500/40"></div>
      <span className="text-green-600 dark:text-green-500 font-mono text-xs uppercase tracking-widest">{subtitle}</span>
    </div>
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-black dark:text-white leading-[0.9]">
      {title}
    </h1>
  </div>
);
