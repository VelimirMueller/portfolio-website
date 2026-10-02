'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Command, CornerDownLeft } from 'lucide-react';

export interface PaletteAction {
  id: string;
  group: string;
  label: string;
  hint?: string;
  run: () => void;
}

/** Every word of the query must appear somewhere in "group label". */
export function matchActions(actions: PaletteAction[], query: string): PaletteAction[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return actions;
  return actions.filter((a) => {
    const hay = `${a.group} ${a.label}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/**
 * ⌘K / Ctrl+K command palette: change the range, chart a metric, filter by a
 * top page or source, focus the flow, jump to a section. A modal combobox:
 * type to narrow, ↑/↓ to move, Enter to run, Esc to close; focus returns to
 * where it was.
 */
export function CommandPalette({ open, onClose, actions }: { open: boolean; onClose: () => void; actions: PaletteAction[] }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const results = useMemo(() => matchActions(actions, query), [actions, query]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    setQuery('');
    setIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      (returnFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [index]);

  if (!open) return null;

  const run = (a: PaletteAction | undefined) => {
    if (!a) return;
    onClose();
    a.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === 'Tab') {
      // Single focusable control: keep focus inside the dialog.
      e.preventDefault();
    }
  };

  let lastGroup = '';
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm motion-safe:animate-scale-in" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] shadow-[0_0_80px_rgba(14,165,198,0.18)]"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <Command size={16} className="text-cyan-300" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `palette-${results[index].id}` : undefined}
            aria-autocomplete="list"
            placeholder="Type a command, page or source…"
            className="w-full bg-transparent text-sm text-white placeholder:text-[#7c808b] focus:outline-none"
          />
          <kbd className="rounded border border-white/10 px-1.5 font-mono text-[10px] text-gray-400">esc</kbd>
        </div>
        <ul id="palette-list" ref={listRef} role="listbox" aria-label="Commands" className="max-h-80 overflow-y-auto p-2">
          {results.map((a, i) => {
            const header = a.group !== lastGroup ? a.group : null;
            lastGroup = a.group;
            return (
              <li key={a.id} role="presentation">
                {header && <div className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-[#7c808b]">{header}</div>}
                <div
                  id={`palette-${a.id}`}
                  role="option"
                  aria-selected={i === index}
                  data-index={i}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => run(a)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                    i === index ? 'bg-cyan-400/10 text-white' : 'text-gray-300'
                  }`}
                >
                  <span className="truncate">{a.label}</span>
                  {a.hint && <kbd className="shrink-0 rounded border border-white/10 px-1.5 font-mono text-[10px] text-gray-400">{a.hint}</kbd>}
                  {i === index && !a.hint && <CornerDownLeft size={12} className="shrink-0 text-gray-400" aria-hidden="true" />}
                </div>
              </li>
            );
          })}
          {!results.length && <li className="px-3 py-6 text-center text-sm text-[#7c808b]">No command matches “{query}”.</li>}
        </ul>
      </div>
    </div>
  );
}
