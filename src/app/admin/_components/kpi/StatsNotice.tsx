/**
 * Calm inline notice when admin_dashboard_stats() cannot be read — e.g. the
 * migration has not run in this environment yet. Shown inside the tab, never
 * a crash.
 */
export function StatsNotice() {
  return (
    <p
      role="status"
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-gray-400"
    >
      Stats are not available yet — run migration 20261010060000
    </p>
  );
}
