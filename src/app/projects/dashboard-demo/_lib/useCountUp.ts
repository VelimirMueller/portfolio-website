import { useEffect, useRef, useState } from 'react';

/** Counts from 0 up to `end` with an ease-out curve over `duration` ms (requestAnimationFrame). */
export function useCountUp(end: number, duration = 1500): number {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setCurrent(Math.round(ease(progress) * end));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [end, duration]);

  return current;
}
