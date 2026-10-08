import { cardImage, manaSymbols, type ManaColor } from '../../_lib/magic/collection';

// Small building blocks shared by the pool, the deck and the catalog search.

// Pip colors follow the card frames; hybrid symbols ({W/U}) show a split pip.
export const PIP: Record<ManaColor, string> = {
  W: '#F8F1D4',
  U: '#3B82F6',
  B: '#6B6B6B',
  R: '#EF4444',
  G: '#22C55E',
};

function isPipColor(s: string): s is ManaColor {
  return s in PIP;
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

/** Thin strip in the card's colors, like a frame. */
export function frameGradient(colors: ManaColor[]): string {
  if (!colors.length) return '#9CA3AF';
  if (colors.length === 1) return PIP[colors[0]];
  return `linear-gradient(90deg, ${colors.map((c) => PIP[c]).join(', ')})`;
}

/**
 * Card image (cached in the database on first view), or a framed placeholder
 * for cards Scryfall does not know. Clicking opens the large image in a new tab.
 */
export function CardImage({
  name,
  url,
  colors,
  size = 'small',
  className = '',
}: {
  name: string;
  url: string | null;
  colors: ManaColor[];
  size?: 'small' | 'normal';
  className?: string;
}) {
  const box = `aspect-[488/680] rounded-[4.75%/3.5%] overflow-hidden shrink-0 ${className}`;
  const src = cardImage(url, size);
  const large = cardImage(url, 'large');
  if (!src || !large) {
    return (
      <div className={`${box} border border-[#333] bg-[#0b0b0b] flex flex-col`} role="img" aria-label={`${name} (no image)`}>
        <div className="h-1.5 shrink-0" style={{ background: frameGradient(colors) }} />
        <span className="m-auto px-2 text-center text-[10px] text-gray-500">No image</span>
      </div>
    );
  }
  return (
    <a href={large} target="_blank" rel="noreferrer" className={`${box} block bg-[#0b0b0b]`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- cached card image, already sized */}
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    </a>
  );
}
