'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type From = 'bottom' | 'top' | 'left' | 'right' | 'bottom-left' | 'bottom-right';

interface AnimateInProps {
  children: React.ReactNode;
  from?: From;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  as?: React.ElementType;
}

/**
 * - static: no inline style. Server render, first paint, content already in view, reduced motion.
 * - pending: below the fold, offset, waiting to scroll into view.
 * - revealing: sliding back to its place; returns to static when done.
 */
type Phase = 'static' | 'pending' | 'revealing';

const DEFAULTS = { delay: 0, duration: 600, distance: 24, threshold: 0.1 };

/** A finite, non-negative number, else the fallback. Guards against NaN, Infinity and negative props. */
const nonNegative = (value: number, fallback: number) => (Number.isFinite(value) && value >= 0 ? value : fallback);

/** IntersectionObserver throws a RangeError outside [0, 1]. */
const toThreshold = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULTS.threshold);

const getTranslate = (from: string, distance: number): string => {
  switch (from) {
    case 'top':
      return `translate(0, -${distance}px)`;
    case 'left':
      return `translate(-${distance}px, 0)`;
    case 'right':
      return `translate(${distance}px, 0)`;
    case 'bottom-left':
      return `translate(-${distance * 0.7}px, ${distance}px)`;
    case 'bottom-right':
      return `translate(${distance * 0.7}px, ${distance}px)`;
    case 'bottom':
    default:
      return `translate(0, ${distance}px)`;
  }
};

// Shared IntersectionObserver per threshold to avoid creating dozens of instances
const observerMap = new Map<number, IntersectionObserver>();
const callbackMap = new Map<Element, (isIntersecting: boolean) => void>();

function getSharedObserver(threshold: number): IntersectionObserver {
  if (!observerMap.has(threshold)) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = callbackMap.get(entry.target);
          if (cb) cb(entry.isIntersecting);
        });
      },
      { threshold },
    );
    observerMap.set(threshold, observer);
  }
  return observerMap.get(threshold)!;
}

/**
 * Slides a block into place when it scrolls into view.
 *
 * The content is always visible: the server renders it without inline styles, so the page paints before JavaScript
 * loads, and content that is already in view on mount never moves. Only blocks below the fold get offset, and only
 * with `transform`. Never `opacity`, `filter` or `will-change: opacity`: each makes this wrapper a backdrop root, so
 * the glass panels inside (`backdrop-filter`) would render flat until the animation ends and then snap to blurred.
 */
export const AnimateIn: React.FC<AnimateInProps> = ({
  children,
  from = 'bottom',
  delay: delayProp = DEFAULTS.delay,
  duration: durationProp = DEFAULTS.duration,
  distance: distanceProp = DEFAULTS.distance,
  threshold: thresholdProp = DEFAULTS.threshold,
  once = true,
  className = '',
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>('static');
  const reducedMotion = useReducedMotion();

  const delay = nonNegative(delayProp, DEFAULTS.delay);
  const duration = nonNegative(durationProp, DEFAULTS.duration);
  const distance = nonNegative(distanceProp, DEFAULTS.distance);
  const threshold = toThreshold(thresholdProp);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || typeof IntersectionObserver === 'undefined') {
      setPhase('static');
      return;
    }
    // Already on screen (or scrolled past): it was painted in place, so moving it now would be a jump.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setPhase('static');
      if (once) return;
    } else {
      setPhase('pending');
    }

    const observer = getSharedObserver(threshold);
    callbackMap.set(el, (isIntersecting) => {
      if (isIntersecting) {
        setPhase((p) => (p === 'pending' ? 'revealing' : p));
        if (once) {
          observer.unobserve(el);
          callbackMap.delete(el);
        }
      } else if (!once && el.getBoundingClientRect().top >= window.innerHeight) {
        setPhase('pending');
      }
    });

    observer.observe(el);
    return () => {
      observer.unobserve(el);
      callbackMap.delete(el);
    };
  }, [threshold, once, reducedMotion]);

  // Drop the inline styles after the slide so CSS hover transforms work again.
  useEffect(() => {
    if (phase !== 'revealing') return;
    const timer = setTimeout(() => setPhase('static'), delay + duration + 50);
    return () => clearTimeout(timer);
  }, [phase, delay, duration]);

  const style = useMemo<React.CSSProperties | undefined>(() => {
    if (phase === 'pending') return { transform: getTranslate(from, distance) };
    if (phase === 'revealing') {
      return {
        transform: 'translate(0, 0)',
        transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
      };
    }
    return undefined;
  }, [phase, from, distance, duration, delay]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
};
