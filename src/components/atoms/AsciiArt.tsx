import React from 'react';

interface AsciiArtProps {
  /** The art, line by line. Keep it small: it is a detail, not content. */
  art: string;
  /** Position and size classes from the caller. */
  className?: string;
}

/**
 * Decorative ASCII detail (vm-brand §5: block marks, box-drawing, dry jokes).
 * Hidden from screen readers; never carries meaning. Uses the system mono stack,
 * not Space Mono: the brand font's Latin subset has no box-drawing glyphs, and a
 * per-glyph fallback breaks the columns.
 */
export const AsciiArt = ({ art, className = '' }: AsciiArtProps) => (
  <pre
    aria-hidden="true"
    data-testid="ascii-art"
    className={`[font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] text-[10px] leading-[1.15] whitespace-pre select-none pointer-events-none text-gray-400/80 dark:text-white/20 ${className}`}
  >
    {art}
  </pre>
);

/** The studio mark for the footer. */
export const ASCII_VM = String.raw`
██╗   ██╗███╗   ███╗
██║   ██║████╗ ████║
██║   ██║██╔████╔██║
╚██╗ ██╔╝██║╚██╔╝██║
 ╚████╔╝ ██║ ╚═╝ ██║██╗
  ╚═══╝  ╚═╝     ╚═╝╚═╝`.slice(1);

/** Contact: a small transmitter, sending your message somewhere warm. */
export const ASCII_SIGNAL = String.raw`
      (( ·  ))
   ((   ·    ))
        │
       ╱│╲
      ╱ │ ╲
  ───┴──┴──┴───  tx: ready`.slice(1);

/** 404: the page went for coffee. */
export const ASCII_LOST = String.raw`
 ┌──────────────────────┐
 │  $ cd /this-page     │
 │  no such directory   │
 │  $ _                 │
 └──────────────────────┘
        ( (
         ) )
      ........
      |      |]
      \      /
       '----'   brb, coffee`.slice(1);

/** Service pages: a 72-column divider with a "// 0N" label, as in the READMEs. */
export const asciiDivider = (index: number, label: string) => {
  const head = `── // 0${index} ${label.toUpperCase()} `;
  return head + '─'.repeat(Math.max(4, 72 - head.length));
};
