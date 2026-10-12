import React from 'react';

// Signature marks of a VM. product (vm-brand PLAYBOOK §1a): the `// LABEL` eyebrow and the accent tick.

export const Eyebrow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`relative font-mono text-[11px] uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-5 ${className}`}>{'// '}{children}</p>
);

/** 2 px accent tick. `wide` = 44 px (taglines, labels), default = 24 px (cards). */
export const Tick = ({ wide = false, className = '' }: { wide?: boolean; className?: string }) => (
  <span aria-hidden="true" className={`block h-0.5 bg-brand-500 shrink-0 ${wide ? 'w-11' : 'w-6'} ${className}`} />
);
