// Plain module (no 'use client'): the server page imports parseView from here.
// Importing it from a client module would hand the server a client reference,
// not a function ("(0, x) is not a function" at render time).

/**
 * The KPI page's sections, chosen with the section switcher. "all" shows the
 * whole page; every other view shows one part of it.
 */
export const KPI_VIEWS = [
  { id: 'all', label: 'All', hint: 'Everything on one page' },
  { id: 'overview', label: 'Overview', hint: 'Headline numbers and the trend' },
  { id: 'when', label: 'When', hint: 'Heatmap and live feed' },
  { id: 'audience', label: 'Audience', hint: 'Pages, sources, countries, devices' },
  { id: 'flow', label: 'Flow', hint: 'How visitors move between pages' },
  { id: 'clicks', label: 'Clicks', hint: 'What people click' },
  { id: 'messages', label: 'Messages', hint: 'Contact form KPIs' },
] as const;

export type KpiView = (typeof KPI_VIEWS)[number]['id'];
export type KpiSectionId = Exclude<KpiView, 'all'>;
export const TRAFFIC_VIEWS: KpiSectionId[] = ['overview', 'when', 'audience', 'flow', 'clicks'];

export function parseView(value: string | null | undefined): KpiView {
  return KPI_VIEWS.some((v) => v.id === value) ? (value as KpiView) : 'all';
}

/** Whether a section is on screen in a view. */
export function isVisible(view: KpiView, section: KpiSectionId | 'traffic'): boolean {
  if (view === 'all') return true;
  if (section === 'traffic') return TRAFFIC_VIEWS.includes(view);
  return view === section;
}
