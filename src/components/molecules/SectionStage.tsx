import React from 'react';

/** Section renders in public/art/v2 that have a light version through the CSS filter. */
export type StageArt = 'site-svc-requirements' | 'site-svc-delivery' | 'site-svc-ux' | 'site-svc-stack' | 'site-svc-frontend' | 'site-contact';

// Static class strings: Tailwind only sees literal class names.
const ART: Record<StageArt, string> = {
  'site-svc-requirements': "bg-[url('/art/v2/site-svc-requirements.webp')]",
  'site-svc-delivery': "bg-[url('/art/v2/site-svc-delivery.webp')]",
  'site-svc-ux': "bg-[url('/art/v2/site-svc-ux.webp')]",
  'site-svc-stack': "bg-[url('/art/v2/site-svc-stack.webp')]",
  'site-svc-frontend': "bg-[url('/art/v2/site-svc-frontend.webp')]",
  'site-contact': "bg-[url('/art/v2/site-contact.webp')]",
};

type SectionStageProps = {
  art: StageArt;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
};

/**
 * A block of page content with a large brand render behind it, bleeding past the content column, plus one indigo
 * light, so the glass panels on top have something to blur (vm-brand B-48). Light mode inverts the near-black render
 * and rotates the hue back to indigo, as ArtBackdrop does. The page root needs `overflow-x-clip`.
 */
export const SectionStage = ({ art, side = 'right', children, className = '' }: SectionStageProps) => {
  const right = side === 'right';
  return (
    <div className={`relative isolate ${className}`}>
      <div aria-hidden="true" data-testid="stage-art" className={`absolute -z-10 top-[-10%] h-[120%] w-[100vw] max-w-[1800px] pointer-events-none bg-cover bg-center ${ART[art]} ${right ? 'right-[-30vw] [mask-image:radial-gradient(ellipse_at_62%_50%,black_35%,transparent_78%)]' : 'left-[-30vw] [mask-image:radial-gradient(ellipse_at_38%_50%,black_35%,transparent_78%)]'} invert hue-rotate-180 opacity-50 mix-blend-multiply saturate-150 dark:invert-0 dark:hue-rotate-0 dark:mix-blend-normal dark:opacity-100`} />
      {/* indigo light the glass refracts */}
      <div aria-hidden="true" className={`absolute -z-10 top-[20%] h-[60%] w-[45vw] rounded-full blur-[120px] pointer-events-none bg-brand-500/25 dark:bg-brand-500/30 ${right ? 'right-[-8vw]' : 'left-[-8vw]'}`} />
      {children}
    </div>
  );
};
