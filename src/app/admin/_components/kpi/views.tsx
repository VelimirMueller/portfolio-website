'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { isVisible, parseView, type KpiSectionId, type KpiView } from './viewModel';

export { KPI_VIEWS, TRAFFIC_VIEWS, isVisible, parseView, type KpiSectionId, type KpiView } from './viewModel';

interface ViewState {
  view: KpiView;
  setView: (view: KpiView) => void;
  /** Bumps on every switch, so sections can replay their entry animation. */
  generation: number;
}

const ViewContext = createContext<ViewState>({ view: 'all', setView: () => {}, generation: 0 });

/**
 * Holds the selected view on the client. Switching is instant (no server
 * round trip): the URL is updated with history.replaceState so the view is
 * shareable and survives a reload, and back/forward are followed.
 */
export function KpiViewProvider({ initial, children }: { initial: KpiView; children: ReactNode }) {
  const [view, setViewState] = useState<KpiView>(initial);
  const [generation, setGeneration] = useState(0);

  const setView = useCallback((next: KpiView) => {
    setViewState(next);
    setGeneration((g) => g + 1);
    const url = new URL(window.location.href);
    if (next === 'all') url.searchParams.delete('view');
    else url.searchParams.set('view', next);
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    const onPop = () => {
      setViewState(parseView(new URL(window.location.href).searchParams.get('view')));
      setGeneration((g) => g + 1);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return <ViewContext.Provider value={{ view, setView, generation }}>{children}</ViewContext.Provider>;
}

export const useKpiView = () => useContext(ViewContext);

/**
 * A part of the page that belongs to one view. Hidden sections stay mounted
 * (their state — tabs, flow trail, filters typed into the click board —
 * survives a round trip through other views). A section that comes into view
 * replays a short "drop out of hyperspace" entry.
 */
export function KpiSection({ id, children, className = '' }: { id: KpiSectionId | 'traffic'; children: ReactNode; className?: string }) {
  const { view, generation } = useKpiView();
  const visible = isVisible(view, id);
  const ref = useRef<HTMLDivElement>(null);

  // Restart the CSS entry animation without remounting the children.
  useEffect(() => {
    const el = ref.current;
    if (!el || !visible || generation === 0) return;
    el.classList.remove('motion-safe:animate-warp-in');
    void el.offsetWidth;
    el.classList.add('motion-safe:animate-warp-in');
  }, [visible, generation]);

  return (
    // `!hidden` too: a display utility in className (grid, flex) would beat the hidden attribute.
    <div ref={ref} hidden={!visible} data-kpi-section={id} className={`${className} ${visible ? '' : '!hidden'}`}>
      {children}
    </div>
  );
}
