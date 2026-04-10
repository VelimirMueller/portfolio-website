'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Crosshair, Loader2 } from 'lucide-react';

function fireKey(key: string, code: string, type: 'keydown' | 'keyup') {
  document.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true }));
}

function TouchButton({
  label,
  icon,
  keyName,
  keyCode,
  className = '',
  size = 'normal',
}: {
  label: string;
  icon?: React.ReactNode;
  keyName: string;
  keyCode: string;
  className?: string;
  size?: 'normal' | 'large';
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    fireKey(keyName, keyCode, 'keydown');
    intervalRef.current = setInterval(() => fireKey(keyName, keyCode, 'keydown'), 80);
  }, [keyName, keyCode]);

  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    fireKey(keyName, keyCode, 'keyup');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [keyName, keyCode]);

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
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const initCalled = useRef(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    // Guard against React strict mode double-mount
    if (initCalled.current) return;
    initCalled.current = true;

    // Check WebGL2 support before loading 35MB WASM
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2');
    if (!gl) {
      setErrorMsg('WebGL2 is not supported in this browser. Try Chrome, Firefox, or Edge.');
      setStatus('error');
      return;
    }

    (async () => {
      try {
        // Dynamic import of the ES module from public/ — not a Node module,
        // so we use a variable to prevent TypeScript/webpack from resolving it
        const src = '/games/cyberpunk/game.js';
        const mod = await import(/* webpackIgnore: true */ src);
        await mod.default({ module_or_path: '/games/cyberpunk/game_bg.wasm' });
        setStatus('ready');
      } catch (err) {
        console.error('WASM init failed:', err);
        setErrorMsg(err instanceof Error ? err.message : 'Failed to initialize game');
        setStatus('error');
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50">
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

      {/* Canvas — must exist in DOM before init() because Bevy looks for it */}
      <canvas
        id="bevy-canvas"
        className="w-screen h-screen block"
      />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-4">
          <Loader2 size={32} className="text-orange-500 animate-spin" />
          <div className="text-white/60 font-mono text-sm">Loading WASM...</div>
          <div className="text-white/30 font-mono text-[10px]">~35MB · Rust + Bevy Engine</div>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-4">
          <div className="text-red-400 font-mono text-sm text-center max-w-md px-4">{errorMsg}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 text-sm font-mono hover:bg-white/20 transition-colors"
          >
            Reload
          </button>
        </div>
      )}

      {/* Mobile touch controls */}
      {isMobile && status === 'ready' && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="flex items-end justify-between max-w-lg mx-auto pointer-events-auto">
            {/* D-pad (left side) */}
            <div className="flex flex-col items-center gap-1.5">
              <TouchButton label="W" keyName="w" keyCode="KeyW" />
              <div className="flex gap-1.5">
                <TouchButton label="A" keyName="a" keyCode="KeyA" />
                <TouchButton label="S" keyName="s" keyCode="KeyS" />
                <TouchButton label="D" keyName="d" keyCode="KeyD" />
              </div>
            </div>

            {/* Action buttons (right side) */}
            <div className="flex items-center gap-3">
              <TouchButton
                label="Start/Stop"
                icon={<><Play size={14} className="inline" /><Pause size={14} className="inline ml-0.5" /></>}
                keyName="Enter"
                keyCode="Enter"
              />
              <TouchButton
                label="Shoot"
                icon={<Crosshair size={20} />}
                keyName=" "
                keyCode="Space"
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
