'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Crosshair } from 'lucide-react';

function fireKeyToIframe(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  key: string,
  code: string,
  type: 'keydown' | 'keyup',
) {
  const win = iframeRef.current?.contentWindow;
  if (!win) return;
  win.document.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true }));
}

function TouchButton({
  label,
  icon,
  keyName,
  keyCode,
  iframeRef,
  className = '',
  size = 'normal',
}: {
  label: string;
  icon?: React.ReactNode;
  keyName: string;
  keyCode: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
  size?: 'normal' | 'large';
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    fireKeyToIframe(iframeRef, keyName, keyCode, 'keydown');
    intervalRef.current = setInterval(() => fireKeyToIframe(iframeRef, keyName, keyCode, 'keydown'), 80);
  }, [iframeRef, keyName, keyCode]);

  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    fireKeyToIframe(iframeRef, keyName, keyCode, 'keyup');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [iframeRef, keyName, keyCode]);

  const sizeClasses = size === 'large'
    ? 'w-16 h-16 text-base'
    : 'w-12 h-12 text-xs';

  return (
    <button
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      className={`${sizeClasses} rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 active:bg-white/25 active:scale-95 transition-all flex items-center justify-center select-none touch-none ${className}`}
      aria-label={label}
    >
      {icon ?? label}
    </button>
  );
}

export default function CyberpunkArcadePage() {
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-mono transition-colors pointer-events-auto"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </Link>
        <div className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
          {isMobile ? 'Touch Controls Active' : 'WASD · Space · Enter'}
        </div>
      </div>

      {/* Game iframe — static HTML gives Bevy full canvas control */}
      <iframe
        ref={iframeRef}
        src="/games/cyberpunk/index.html"
        className="flex-1 w-full border-0"
        allow="autoplay"
        title="Cyberpunk Arcade Shooter"
      />

      {/* Mobile touch controls */}
      {isMobile && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="flex items-end justify-between max-w-lg mx-auto pointer-events-auto">
            {/* D-pad (left side) */}
            <div className="flex flex-col items-center gap-1.5">
              <TouchButton label="W" keyName="w" keyCode="KeyW" iframeRef={iframeRef} />
              <div className="flex gap-1.5">
                <TouchButton label="A" keyName="a" keyCode="KeyA" iframeRef={iframeRef} />
                <TouchButton label="S" keyName="s" keyCode="KeyS" iframeRef={iframeRef} />
                <TouchButton label="D" keyName="d" keyCode="KeyD" iframeRef={iframeRef} />
              </div>
            </div>

            {/* Action buttons (right side) */}
            <div className="flex items-center gap-3">
              <TouchButton
                label="Start/Stop"
                icon={<><Play size={14} className="inline" /><Pause size={14} className="inline ml-0.5" /></>}
                keyName="Enter"
                keyCode="Enter"
                iframeRef={iframeRef}
              />
              <TouchButton
                label="Shoot"
                icon={<Crosshair size={20} />}
                keyName=" "
                keyCode="Space"
                iframeRef={iframeRef}
                size="large"
                className="bg-red-500/20 border-red-500/40 active:bg-red-500/40"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
