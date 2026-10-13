import { BarChart3, LayoutDashboard, Settings, Users, Workflow } from 'lucide-react';

/** The five views of the demo, in sidebar order. `title` names the view in the header search. */
export const VIEWS = [
  { id: 'dashboard', label: 'Dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', title: 'Sales Pipeline', icon: Users },
  { id: 'workflows', label: 'Workflows', title: 'Workflows', icon: Workflow },
  { id: 'analytics', label: 'Analytics', title: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', title: 'Settings', icon: Settings },
] as const;

export type ViewId = (typeof VIEWS)[number]['id'];

/** The view for an id; an unknown id falls back to the dashboard. */
export function findView(id: string): (typeof VIEWS)[number] {
  return VIEWS.find((v) => v.id === id) ?? VIEWS[0];
}
