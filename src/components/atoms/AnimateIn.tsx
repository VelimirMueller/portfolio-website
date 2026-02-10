'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimateInProps {
  children: React.ReactNode;
  from?: 'bottom' | 'top' | 'left' | 'right' | 'bottom-left' | 'bottom-right';
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  as?: React.ElementType;
}

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

export const AnimateIn: React.FC<AnimateInProps> = ({
  children,
  from = 'bottom',
  delay = 0,
  duration = 600,
  distance = 24,
  threshold = 0.1,
  once = true,
  className = '',
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) {
      setIsVisible(true);
      setAnimationComplete(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, reducedMotion]);

  // Clear inline styles after animation finishes so CSS hover transforms work
  useEffect(() => {
    if (isVisible && !reducedMotion && !animationComplete) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, delay + duration + 50);
      return () => clearTimeout(timer);
    }
  }, [isVisible, reducedMotion, animationComplete, delay, duration]);

  const style: React.CSSProperties = useMemo(() => {
    if (reducedMotion || animationComplete) {
      return {};
    }
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translate(0, 0)' : getTranslate(from, distance),
      transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      transitionDelay: `${delay}ms`,
      willChange: 'opacity, transform',
    };
  }, [isVisible, animationComplete, reducedMotion, from, distance, duration, delay]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
};
