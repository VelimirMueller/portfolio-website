'use client';

import { useState } from 'react';
import { ArrowLeft, DoorOpen, Globe, FileText, MoreHorizontal } from 'lucide-react';
import type { Flow, FlowNode, Ranked } from '../../_lib/traffic';
import { formatCount, sourceLabel } from './format';
import { VIZ } from './Panel';

const ROW = 56;
const NODE_H = 44;

function nodeLabel(n: FlowNode): string {
  if (n.kind === 'exit') return 'Left the site';
  if (n.kind === 'other') return 'Other';
  if (n.kind === 'source') return sourceLabel(n.key);
  return n.key;
}

const ICON = { page: FileText, source: Globe, exit: DoorOpen, other: MoreHorizontal } as const;

/** Ribbon between two vertical spans, as a filled shape (scales cleanly with preserveAspectRatio="none"). */
function ribbon(x1: number, y1a: number, y1b: number, x2: number, y2a: number, y2b: number): string {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1a} C${mx},${y1a} ${mx},${y2a} ${x2},${y2a} L${x2},${y2b} C${mx},${y2b} ${mx},${y1b} ${x1},${y1b} Z`;
}

function Column({
  nodes,
  side,
  total,
  hovered,
  onHover,
  onPick,
}: {
  nodes: FlowNode[];
  side: 'in' | 'out';
  total: number;
  hovered: string | null;
  onHover: (id: string | null) => void;
  onPick: (n: FlowNode) => void;
}) {
  return (
    <ul className="space-y-3" aria-label={side === 'in' ? 'Came from' : 'Went to'}>
      {nodes.map((n) => {
        const id = `${side}:${n.kind}:${n.key}`;
        const Icon = ICON[n.kind];
        const pickable = n.kind === 'page' || n.kind === 'source';
        const pct = Math.round((n.count / total) * 100);
        const content = (
          <>
            <Icon size={14} aria-hidden="true" className={n.kind === 'exit' ? 'text-amber-500' : side === 'in' ? 'text-cyan-300' : 'text-fuchsia-300'} />
            <span className="min-w-0 flex-1 truncate">{nodeLabel(n)}</span>
            <span className="font-mono text-[11px] text-gray-400">
              {formatCount(n.count)} <span className="text-[#7c808b]">· {pct}%</span>
            </span>
          </>
        );
        const cls = `flex h-11 w-full items-center gap-2 rounded-xl border px-3 text-left text-xs transition-all ${
          hovered === id ? 'border-white/30 bg-white/[0.06] text-white' : 'border-white/[0.08] bg-black/30 text-gray-300'
        }`;
        return (
          <li key={id} onPointerEnter={() => onHover(id)} onPointerLeave={() => onHover(null)}>
            {pickable ? (
              <button
                type="button"
                onClick={() => onPick(n)}
                onFocus={() => onHover(id)}
                onBlur={() => onHover(null)}
                title={n.kind === 'page' ? `Follow the flow through ${n.key}` : `Filter to visitors from ${nodeLabel(n)}`}
                className={`${cls} hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 motion-reduce:hover:translate-y-0`}
              >
                {content}
              </button>
            ) : (
              <div className={cls}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Where visitors of one page came from and where they went next. Page nodes
 * are links into the flow: clicking one re-centres the explorer on it, so
 * you can walk a visitor path page by page; the trail lets you walk back.
 * Source nodes filter the dashboard to that source.
 */
export function FlowExplorer({
  flow,
  pages,
  onFocus,
  onSource,
}: {
  flow: Flow | null;
  pages: Ranked[];
  onFocus: (path: string) => void;
  onSource: (source: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [trail, setTrail] = useState<string[]>([]);

  if (!flow) {
    return <p className="py-10 text-center text-sm text-[#7c808b]">No page views in this selection yet.</p>;
  }

  const go = (path: string) => {
    if (path === flow.focus) return;
    setTrail((t) => [...t, flow.focus].slice(-6));
    onFocus(path);
  };
  const back = () => {
    const prev = trail[trail.length - 1];
    if (!prev) return;
    setTrail((t) => t.slice(0, -1));
    onFocus(prev);
  };
  const pick = (n: FlowNode) => (n.kind === 'page' ? go(n.key) : n.kind === 'source' ? onSource(n.key) : undefined);

  const rows = Math.max(flow.inbound.length, flow.outbound.length, 1);
  const height = rows * ROW - (ROW - NODE_H);
  const inTotal = flow.inbound.reduce((s, n) => s + n.count, 0) || 1;
  const outTotal = flow.outbound.reduce((s, n) => s + n.count, 0) || 1;

  // Ribbons: left column (x 0) → centre (x 100) and centre → right column, in a 0..100 × height box per gap.
  const span = (nodes: FlowNode[], total: number) => {
    let offset = 0;
    return nodes.map((n, i) => {
      const yNode = i * ROW + NODE_H / 2;
      const thickness = Math.max(3, (n.count / total) * (height - 8));
      const centreTop = 4 + offset;
      offset += thickness;
      return { n, yNode, thickness, centreTop };
    });
  };
  const inSpans = span(flow.inbound, inTotal);
  const outSpans = span(flow.outbound, outTotal);

  // A render function, not a component: a component declared here would remount on every hover.
  const ribbons = (spans: ReturnType<typeof span>, side: 'in' | 'out') => (
    <svg aria-hidden="true" className="hidden h-full w-full md:block" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`flow-${side}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={side === 'in' ? VIZ.visitors : VIZ.pageviews} stopOpacity="0.55" />
          <stop offset="100%" stopColor={side === 'in' ? VIZ.pageviews : VIZ.clicks} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {spans.map(({ n, yNode, thickness, centreTop }) => {
        const id = `${side}:${n.kind}:${n.key}`;
        // Thin at the node (its share of the node height), full width where it merges into the page.
        const t = Math.max(2, (n.count / (side === 'in' ? inTotal : outTotal)) * (NODE_H - 8));
        const d =
          side === 'in'
            ? ribbon(0, yNode - t / 2, yNode + t / 2, 100, centreTop, centreTop + thickness)
            : ribbon(0, centreTop, centreTop + thickness, 100, yNode - t / 2, yNode + t / 2);
        const dim = hovered !== null && hovered !== id;
        return (
          <path
            key={`${flow.focus}-${id}`}
            d={d}
            fill={n.kind === 'exit' ? VIZ.clicks : `url(#flow-${side})`}
            // fill-opacity, not opacity: the entry animation's fill-mode would pin opacity at 1.
            fillOpacity={dim ? 0.1 : hovered === id ? 0.9 : 0.42}
            className="transition-[fill-opacity] duration-200 motion-safe:animate-fade-in-up"
          />
        );
      })}
    </svg>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={back}
          disabled={!trail.length}
          aria-label="Back to the previous page in the flow"
          className="rounded-full border border-white/[0.08] p-1.5 text-gray-400 transition-colors hover:text-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <ArrowLeft size={14} aria-hidden="true" />
        </button>
        <label className="sr-only" htmlFor="flow-focus">
          Page to explore
        </label>
        <select
          id="flow-focus"
          value={flow.focus}
          onChange={(e) => go(e.target.value)}
          className="rounded-full border border-white/[0.1] bg-black/50 px-3 py-1.5 font-mono text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {!pages.some((p) => p.key === flow.focus) && <option value={flow.focus}>{flow.focus}</option>}
          {pages.map((p) => (
            <option key={p.key} value={p.key}>
              {p.key}
            </option>
          ))}
        </select>
        {trail.length > 0 && (
          <ol aria-label="Flow trail" className="flex flex-wrap items-center gap-1 font-mono text-[10px] text-[#7c808b]">
            {trail.map((p, i) => (
              <li key={`${p}-${i}`} className="after:ml-1 after:content-['→']">
                {p}
              </li>
            ))}
            <li className="text-cyan-300">{flow.focus}</li>
          </ol>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,0.7fr)_4.5rem_minmax(0,1fr)]">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">Came from</p>
          <Column nodes={flow.inbound} side="in" total={inTotal} hovered={hovered} onHover={setHovered} onPick={pick} />
        </div>
        <div className="mt-6 hidden md:block" style={{ height }}>
          {ribbons(inSpans, 'in')}
        </div>
        <div className="md:mt-6">
          <div
            key={flow.focus}
            className="flex h-full min-h-[7rem] md:min-h-[var(--flow-h)] flex-col items-center justify-center rounded-2xl border border-fuchsia-400/30 bg-gradient-to-b from-fuchsia-500/[0.12] to-cyan-500/[0.06] p-4 text-center shadow-[0_0_40px_rgba(217,70,239,0.12)] motion-safe:animate-scale-in"
            style={{ ['--flow-h' as string]: `${height}px` }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-200/70">Page</span>
            <span className="mt-1 break-all font-mono text-sm font-bold text-white">{flow.focus}</span>
            <span className="mt-2 font-mono text-2xl font-bold text-white">{formatCount(flow.views)}</span>
            <span className="text-[11px] text-gray-400">views</span>
          </div>
        </div>
        <div className="mt-6 hidden md:block" style={{ height }}>
          {ribbons(outSpans, 'out')}
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">Went to</p>
          <Column nodes={flow.outbound} side="out" total={outTotal} hovered={hovered} onHover={setHovered} onPick={pick} />
        </div>
      </div>
    </div>
  );
}
