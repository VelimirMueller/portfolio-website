import React from 'react';

/**
 * The Flagship group backdrop (vm-brand B-34: indigo #6366f1): an indigo aurora curtain over the top of
 * the page, a horizon beam and a perspective grid that fades into it. Replaces the multi-colour blobs.
 * Pure CSS, fixed behind the content, decorative only. Motion stops under prefers-reduced-motion
 * (globals.css), the layout stays.
 */
export const BrandAurora = () => (
  <div aria-hidden="true" data-testid="brand-aurora" className="fixed inset-x-0 top-0 h-[90vh] -z-10 pointer-events-none overflow-hidden">
    {/* curtain: three indigo lights, slowly drifting */}
    <div className="absolute left-1/2 -top-[35vh] w-[140vw] h-[80vh] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(99,102,241,0.55),rgba(99,102,241,0)_100%)] opacity-40 dark:opacity-70 blur-3xl motion-safe:animate-aurora-a" />
    <div className="absolute left-[8%] -top-[20vh] w-[60vw] h-[60vh] rounded-[50%] bg-[radial-gradient(closest-side,rgba(129,140,248,0.5),rgba(129,140,248,0)_100%)] opacity-30 dark:opacity-50 blur-3xl motion-safe:animate-aurora-b" />
    <div className="absolute right-[2%] -top-[18vh] w-[55vw] h-[55vh] rounded-[50%] bg-[radial-gradient(closest-side,rgba(49,46,129,0.9),rgba(49,46,129,0)_100%)] opacity-20 dark:opacity-80 blur-3xl motion-safe:animate-aurora-c" />
    {/* vertical light rays through the curtain */}
    <div className="absolute inset-x-0 top-0 h-[55vh] opacity-25 dark:opacity-40 bg-[repeating-linear-gradient(90deg,rgba(165,180,252,0)_0px,rgba(165,180,252,0)_46px,rgba(165,180,252,0.12)_48px,rgba(165,180,252,0)_50px)] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    {/* horizon beam */}
    <div className="absolute left-1/2 top-[46vh] w-[90vw] h-px -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(129,140,248,0.9),transparent)] opacity-60 dark:opacity-90" />
    <div className="absolute left-1/2 top-[46vh] w-[70vw] h-24 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-indigo-500/20 dark:bg-indigo-500/25 blur-3xl" />
    {/* perspective floor grid under the horizon */}
    <div className="absolute left-1/2 top-[46vh] w-[200vw] h-[60vh] origin-top [transform:translateX(-50%)_perspective(600px)_rotateX(62deg)] bg-[linear-gradient(to_right,rgba(129,140,248,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(129,140,248,0.22)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] opacity-50 dark:opacity-70" />
  </div>
);
