import React from 'react';

interface ArtBackdropProps {
  /** Static Tailwind classes for the background image, its position, size and mask. Nothing else. */
  className: string;
}

/**
 * Decorative brand art behind card content. The renders are near-black, so light
 * mode inverts them and rotates the hue back to the accent.
 */
export const ArtBackdrop = ({ className }: ArtBackdropProps) => (
  <div
    aria-hidden="true"
    data-testid="art-backdrop"
    className={`absolute inset-0 pointer-events-none bg-no-repeat invert hue-rotate-180 mix-blend-multiply opacity-50 dark:invert-0 dark:hue-rotate-0 dark:mix-blend-screen dark:opacity-90 ${className}`}
  />
);
