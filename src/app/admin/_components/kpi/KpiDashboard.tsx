'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KPI_TABS, parseKpiTab, type KpiTab } from '../../_lib/dashboardStats';
import { Tabs } from '../ui/Tabs';

/**
 * The KPI page's top tabs: Website | Supabase | Vercel | Magic. Switching is
 * instant (no server round trip); the tab lives in ?tab= via
 * history.replaceState, exactly as the section switcher keeps ?view= inside
 * the Website tab. All panels stay mounted, so the website view — and its
 * ?view= — survives a round trip through the other tabs.
 */
export function KpiDashboard({
  initialTab,
  panels,
}: {
  initialTab: KpiTab;
  panels: Record<KpiTab, ReactNode>;
}) {
  const [tab, setTabState] = useState<KpiTab>(initialTab);

  const setTab = useCallback((next: KpiTab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    if (next === 'website') url.searchParams.delete('tab');
    else url.searchParams.set('tab', next);
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    const onPop = () => setTabState(parseKpiTab(new URL(window.location.href).searchParams.get('tab')));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const tabs = KPI_TABS.map(({ id, label }) => ({ key: id, label, content: panels[id] }));
  return <Tabs tabs={tabs} value={tab} onChange={setTab} label="KPI area" id="kpi-tab" />;
}
