// Pure helpers of the CRM demo: number formats, chart geometry and derived values.
// No React here, so the unit tests cover them directly.

export function formatNumber(n: number, prefix = '', suffix = ''): string {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M${suffix}`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(n % 1000 === 0 ? 0 : 1)}K${suffix}`;
  return `${prefix}${n.toLocaleString()}${suffix}`;
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

/** Bar colour of a deal's win probability. */
export function probabilityColor(probability: number): string {
  return probability > 70 ? 'bg-green-500' : probability > 50 ? 'bg-blue-500' : 'bg-orange-500';
}

/** A rising trend is good, except for metrics where lower is better (CAC, churn). */
export function isTrendGood(trend: number, lowerIsBetter: boolean): boolean {
  return lowerIsBetter ? trend < 0 : trend > 0;
}

/** Sum of the deal values, and the sum weighted by each deal's win probability. */
export function pipelineTotals(deals: readonly { value: number; probability: number }[]): { total: number; weighted: number } {
  return {
    total: deals.reduce((s, d) => s + d.value, 0),
    weighted: deals.reduce((s, d) => s + d.value * (d.probability / 100), 0),
  };
}

/** Heatmap cell colour of a retention value (percent); null is a month not reached yet. */
export function cohortColor(value: number | null): string {
  if (value === null) return 'bg-[#1a1a1a]';
  if (value >= 95) return 'bg-green-500/80';
  if (value >= 90) return 'bg-green-500/60';
  if (value >= 85) return 'bg-green-500/40';
  if (value >= 80) return 'bg-green-500/20';
  return 'bg-green-500/10';
}

/** Polyline points of a 60x24 sparkline; a flat series draws a flat line. */
export function sparklinePoints(data: readonly number[]): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => `${(i / (data.length - 1)) * 56},${20 - ((v - min) / range) * 16}`).join(' ');
}

/** Points, smooth line path and filled area path of the revenue chart. */
export function revenueChartGeometry(
  values: readonly number[],
  { w, h, padX, padY }: { w: number; h: number; padX: number; padY: number },
) {
  const maxVal = Math.max(...values);
  const points = values.map((value, i) => ({
    x: padX + (i / (values.length - 1)) * (w - padX * 2),
    y: padY + (1 - value / maxVal) * (h - padY * 2),
  }));
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const prev = points[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = prev.x + (p.x - prev.x) * 0.6;
      return `C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
    })
    .join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
  return { points, pathD, areaD };
}

/** Notifications not read yet. */
export const unreadCount = (items: readonly { read: boolean }[]): number => items.filter((n) => !n.read).length;

/** Today's actions that are not overdue (the badge count). */
export const openActionCount = (items: readonly { overdue: boolean }[]): number => items.filter((t) => !t.overdue).length;
