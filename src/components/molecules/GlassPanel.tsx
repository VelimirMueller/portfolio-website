import React from 'react';

/** Grid fading out from the top plus one soft indigo glow: the frame of every glass panel. */
export const PanelFrame = () => (
  <>
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#8080800f_1px,transparent_1px),linear-gradient(to_bottom,#8080800f_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />
    <div aria-hidden="true" className="absolute -top-40 right-[5%] w-[45%] h-80 rounded-full bg-brand-500/10 dark:bg-brand-500/15 blur-[90px] pointer-events-none" />
  </>
);

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  /** Element to render. Default: section. */
  as?: 'section' | 'div' | 'figure' | 'article';
  /** Grid and glow frame. Off for small panels. */
  frame?: boolean;
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>;

/**
 * Liquid-glass panel (`.glass` in globals.css, vm-brand B-48). Put it on a SectionStage: glass only reads as glass
 * over art. Children sit above the frame.
 */
export const GlassPanel = ({ children, className = '', as: Tag = 'section', frame = true, ...rest }: GlassPanelProps) => (
  <Tag className={`glass rounded-3xl overflow-hidden ${className}`} {...rest}>
    {frame && <PanelFrame />}
    {children}
  </Tag>
);

/** Class string for cards inside a glass panel (`.glass-inner`). */
export const glassCard = 'glass-inner rounded-2xl';
