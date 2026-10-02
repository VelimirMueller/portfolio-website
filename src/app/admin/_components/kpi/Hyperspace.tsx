'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface HyperspaceHandle {
  /** Light-speed burst radiating from x (CSS px within the canvas). */
  jump: (x: number) => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  hue: number;
}

const STARS = 140;
const IDLE_SPEED = 0.0016;
const WARP_SPEED = 0.05;
const WARP_MS = 700;
const HUES = [190, 190, 190, 295, 210, 0]; // mostly cyan, some magenta/blue, a few white (hue 0 drawn desaturated)

/**
 * A slow starfield behind the section switcher; jump() accelerates it into
 * light-speed streaks that radiate from the chosen option, then settles back.
 *
 * Decoration only: aria-hidden, pointer-events none, paused while the tab or
 * the canvas is off-screen, and a single static frame with reduced motion.
 */
export const Hyperspace = forwardRef<HyperspaceHandle>(function Hyperspace(_, handle) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warp = useRef<{ start: number; x: number } | null>(null);
  const reduced = useRef(false);

  useImperativeHandle(handle, () => ({
    jump: (x: number) => {
      if (!reduced.current) warp.current = { start: performance.now(), x };
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    reduced.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const stars: Star[] = Array.from({ length: STARS }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
      hue: HUES[Math.floor(Math.random() * HUES.length)],
    }));

    let raf = 0;
    let visible = true;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      ctx.clearRect(0, 0, w, h);

      // Warp envelope: ramps up fast, eases down; origin follows the chosen option.
      let boost = 0;
      let cx = w / 2;
      if (warp.current) {
        const t = (now - warp.current.start) / WARP_MS;
        if (t >= 1) warp.current = null;
        else {
          boost = Math.sin(Math.PI * Math.min(1, t * 1.6)) * (1 - t * 0.4);
          cx = warp.current.x;
        }
      }
      const speed = IDLE_SPEED + (WARP_SPEED - IDLE_SPEED) * boost;
      const cy = h / 2;
      const scale = Math.max(w, h * 4) * 0.5;

      for (const s of stars) {
        const prevZ = s.z;
        s.z -= speed * (dt / 16);
        if (s.z <= 0.02) {
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          s.z = 1;
          continue;
        }
        const px = cx + (s.x / s.z) * scale;
        const py = cy + (s.y / s.z) * scale * 0.35;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) {
          s.z = 1;
          continue;
        }
        const alpha = Math.min(1, (1 - s.z) * 1.4) * (0.35 + 0.65 * boost);
        const color = s.hue === 0 ? `rgba(255,255,255,${alpha})` : `hsla(${s.hue}, 95%, 70%, ${alpha})`;
        if (boost > 0.05) {
          // Streak from where the star was a moment ago.
          const tx = cx + (s.x / (prevZ + speed * 6)) * scale;
          const ty = cy + (s.y / (prevZ + speed * 6)) * scale * 0.35;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1 + boost;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          const r = (1 - s.z) * 1.4 + 0.2;
          ctx.fillRect(px - r / 2, py - r / 2, r, r);
        }
      }

      if (boost > 0) {
        // A soft flash at the jump origin.
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.35);
        g.addColorStop(0, `rgba(14,165,198,${0.25 * boost})`);
        g.addColorStop(1, 'rgba(14,165,198,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      if (visible && !reduced.current) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting && document.visibilityState === 'visible';
            if (visible) start();
          })
        : null;
    io?.observe(canvas);
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced.current) draw(performance.now());
    else start();

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
});
