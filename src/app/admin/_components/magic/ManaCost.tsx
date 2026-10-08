import { manaSymbols } from '../../_lib/magic/cards';
import type { ManaColor } from '../../_lib/magic/types';

// Pip colors follow the card frames; hybrid symbols ({W/U}) show a split pip.
export const PIP: Record<ManaColor, string> = {
  W: '#F8F1D4',
  U: '#3B82F6',
  B: '#6B6B6B',
  R: '#EF4444',
  G: '#22C55E',
};

const isPipColor = (s: string): s is ManaColor => s in PIP;

/** Thin strip in the card's colors, like a frame. */
export function frameGradient(colors: ManaColor[]): string {
  if (!colors.length) return '#9CA3AF';
  if (colors.length === 1) return PIP[colors[0]];
  return `linear-gradient(90deg, ${colors.map((c) => PIP[c]).join(', ')})`;
}

function ManaPip({ symbol }: { symbol: string }) {
  const parts = symbol.split('/').filter(isPipColor);
  const base = 'inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold border border-black/40';
  if (parts.length === 2) {
    return (
      <span
        className={base}
        style={{ background: `linear-gradient(135deg, ${PIP[parts[0]]} 50%, ${PIP[parts[1]]} 50%)` }}
        title={symbol}
      />
    );
  }
  if (parts.length === 1) return <span className={base} style={{ background: PIP[parts[0]] }} title={symbol} />;
  return <span className={`${base} bg-gray-400 text-black`}>{symbol}</span>;
}

export function ManaCost({ cost }: { cost: string | null }) {
  const symbols = manaSymbols(cost);
  if (!symbols.length) return null;
  return (
    <span className="flex gap-0.5 shrink-0" aria-label={`Mana cost ${cost}`}>
      {symbols.map((s, i) => (
        <ManaPip key={i} symbol={s} />
      ))}
    </span>
  );
}
