'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface StarfieldHandle {
  /** Light-speed burst radiating from (x, y), CSS px within the canvas; y defaults to the middle. */
  jump: (x: number, y?: number) => void;
}

export interface StarfieldProps {
  /** Number of stars; the canvas is cheap, but keep it low on small screens. */
  stars?: number;
  /** Vertical squash of the projection: 1 for a full viewport, ~0.35 for a wide, short bar. */
  aspect?: number;
  /** Alpha multiplier for the idle drift (0–1). */
  intensity?: number;
  /** Peak strength of a jump (0–1): streak alpha, width and flash. */
  burst?: number;
  /** "neon" = cyan/magenta/white; "auto" = neon in dark mode, soft ink dots in light mode. */
  tone?: 'neon' | 'auto';
  /** Drift speed at rest (depth units per frame). */
  idleSpeed?: number;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  hue: number;
}

const WARP_SPEED = 0.05;
const WARP_MS = 700;
const NEON_HUES = [190, 190, 190, 295, 210, 0]; // mostly cyan, some magenta/blue, a few white (hue 0 = white)

function starColor(hue: number, alpha: number, light: boolean): string {
  // On a light page, stars are ink: indigo-slate dots, quieter than on dark.
  if (light) return `hsla(${hue === 295 ? 280 : 225}, 45%, ${hue === 0 ? 30 : 42}%, ${alpha * 0.7})`;
  return hue === 0 ? `rgba(255,255,255,${alpha})` : `hsla(${hue}, 95%, 70%, ${alpha})`;
}

/**
 * A depth starfield on a canvas. At rest it drifts slowly toward the viewer;
 * jump() accelerates it into light-speed streaks radiating from a point, then
 * it settles back. Used behind the KPI section switcher and, very faintly,
 * behind the whole public site.
 *
 * Decoration only: aria-hidden, pointer-events none, paused while the tab or
 * the canvas is off-screen, and a single still frame with reduced motion.
 */
export const Starfield = forwardRef<StarfieldHandle, StarfieldProps>(function Starfield(
  { stars: count = 140, aspect = 0.35, intensity = 1, burst = 1, tone = 'neon', idleSpeed = 0.0016, className = 'absolute inset-0 h-full w-full' },
  handle
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warp = useRef<{ start: number; x: number; y: number | null } | null>(null);
  const reduced = useRef(false);

  useImperativeHandle(handle, () => ({
    jump: (x: number, y?: number) => {
      if (!reduced.current) warp.current = { start: performance.now(), x, y: y ?? null };
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    reduced.current = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const isLight = () => tone === 'auto' && !document.documentElement.classList.contains('dark');

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced.current) draw(performance.now());
    };

    const field: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
      hue: NEON_HUES[Math.floor(Math.random() * NEON_HUES.length)],
    }));

    let raf = 0;
    let visible = true;
    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min(now - last, 50);
      last = now;
      ctx!.clearRect(0, 0, w, h);
      const light = isLight();

      // Warp envelope: ramps up fast, eases down; origin follows the jump point.
      let boost = 0;
      let cx = w / 2;
      let cy = h / 2;
      if (warp.current) {
        const t = (now - warp.current.start) / WARP_MS;
        if (t >= 1) warp.current = null;
        else {
          boost = Math.sin(Math.PI * Math.min(1, t * 1.6)) * (1 - t * 0.4);
          cx = warp.current.x;
          if (warp.current.y !== null) cy = warp.current.y;
        }
      }
      const speed = idleSpeed + (WARP_SPEED - idleSpeed) * boost;
      const scale = Math.max(w, aspect < 1 ? h * 4 : h) * 0.5;

      for (const s of field) {
        const prevZ = s.z;
        s.z -= speed * (dt / 16);
        if (s.z <= 0.02) {
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          s.z = 1;
          continue;
        }
        const px = cx + (s.x / s.z) * scale;
        const py = cy + (s.y / s.z) * scale * aspect;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) {
          s.z = 1;
          continue;
        }
        const depth = Math.min(1, (1 - s.z) * 1.4);
        const idle = 0.35 * intensity;
        const alpha = depth * (idle + Math.max(0, burst - idle) * boost);
        const color = starColor(s.hue, alpha, light);
        if (boost > 0.05) {
          // Streak from where the star was a moment ago.
          const tx = cx + (s.x / (prevZ + speed * 6)) * scale;
          const ty = cy + (s.y / (prevZ + speed * 6)) * scale * aspect;
          ctx!.strokeStyle = color;
          ctx!.lineWidth = 1 + boost * burst;
          ctx!.beginPath();
          ctx!.moveTo(tx, ty);
          ctx!.lineTo(px, py);
          ctx!.stroke();
        } else {
          ctx!.fillStyle = color;
          const r = (1 - s.z) * 1.4 + 0.2;
          ctx!.fillRect(px - r / 2, py - r / 2, r, r);
        }
      }

      if (boost > 0) {
        // A soft flash at the jump origin.
        const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.35);
        const glow = light ? '79,70,229' : '14,165,198';
        g.addColorStop(0, `rgba(${glow},${(light ? 0.12 : 0.25) * boost * burst})`);
        g.addColorStop(1, `rgba(${glow},0)`);
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, w, h);
      }

      if (visible && !reduced.current) raf = requestAnimationFrame(draw);
    }

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting && document.visibilityState === 'visible';
            if (visible && !reduced.current) start();
          })
        : null;
    io?.observe(canvas);
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible && !reduced.current) start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    // A theme switch must repaint the still frame too.
    const mo = typeof MutationObserver !== 'undefined' && tone === 'auto' ? new MutationObserver(() => reduced.current && draw(performance.now())) : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (reduced.current) draw(performance.now());
    else start();

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      mo?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count, aspect, intensity, burst, tone, idleSpeed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
});
