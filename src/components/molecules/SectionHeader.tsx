import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <div className="mb-12 md:mb-20">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-green-600 dark:text-green-500 font-mono text-sm">01</span>
      <div className="h-px w-8 bg-green-600/50 dark:bg-green-500/50"></div>
      <span className="text-green-600 dark:text-green-500 font-mono text-sm uppercase tracking-widest">{subtitle}</span>
    </div>
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-black dark:text-white leading-[0.9]">
      {title}
    </h1>
  </div>
);
