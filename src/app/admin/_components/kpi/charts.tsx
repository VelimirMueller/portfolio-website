// Charts in the CRM demo's style (RevenueBarChart / RevenueDonut).
// Server-rendered; motion comes from the shared Tailwind keyframes.

/**
 * Vertical bars. `compact` is for long series (e.g. 30 days): thinner gaps,
 * no value above each bar, and only every `labelEvery`-th label.
 */
export function BarChart({
  values,
  labels,
  label,
  compact = false,
  labelEvery = 1,
}: {
  values: number[];
  labels: readonly string[];
  label: string;
  compact?: boolean;
  labelEvery?: number;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className={`flex items-end justify-between h-40 ${compact ? 'gap-[3px]' : 'gap-1.5'}`} role="img" aria-label={label}>
      {values.map((v, i) => {
        const showLabel = i % labelEvery === 0 || i === values.length - 1;
        return (
          <div key={labels[i]} className="flex flex-col items-center gap-2 w-full min-w-0" title={`${labels[i]}: ${v}`}>
            {!compact && <span className="text-[9px] text-gray-400 font-mono">{v}</span>}
            <div className={`relative w-full bg-[#1a1a1a] overflow-hidden ${compact ? 'h-32 rounded-t-sm' : 'h-28 rounded-t-md'}`}>
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 animate-fade-in-up ${compact ? 'rounded-t-sm' : 'rounded-t-md'}`}
                style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * (compact ? 20 : 80)}ms` }}
              />
            </div>
            <span className={`text-[9px] text-gray-500 font-mono whitespace-nowrap ${showLabel ? '' : 'invisible'}`}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export interface DonutSegment {
  label: string;
  value: number;
  pct: number;
  color: string;
}

export function Donut({ segments, label }: { segments: DonutSegment[]; label: string }) {
  let offset = 0;
  const ring = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" role="img" aria-label={label}>
          <path d={ring} fill="none" stroke="#222" strokeWidth="5" />
          {segments
            .filter((s) => s.pct > 0)
            .map((s) => {
              const el = (
                <path key={s.label} d={ring} fill="none" stroke={s.color} strokeWidth="5" strokeDasharray={`${s.pct}, 100`} strokeDashoffset={-offset} />
              );
              offset += s.pct;
              return el;
            })}
        </svg>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-gray-400">{s.label}</span>
            </div>
            <span className="font-mono text-white">
              {s.value} <span className="text-gray-500">· {s.pct}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
