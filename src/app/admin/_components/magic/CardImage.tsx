import { cardImage } from '../../_lib/magic/cards';
import type { CatalogCard } from '../../_lib/magic/types';
import { frameGradient } from './ManaCost';

/**
 * Card image (cached in the database on first view), or a framed placeholder
 * when the card has no image. Clicking opens the large image in a new tab.
 */
export function CardImage({
  card,
  size = 'small',
  className = '',
}: {
  card: Pick<CatalogCard, 'name' | 'image_url' | 'colors'>;
  size?: 'small' | 'normal';
  className?: string;
}) {
  const box = `aspect-[488/680] rounded-[4.75%/3.5%] overflow-hidden shrink-0 ${className}`;
  const src = cardImage(card.image_url, size);
  const large = cardImage(card.image_url, 'large');
  if (!src || !large) {
    return (
      <div className={`${box} border border-[#333] bg-[#0b0b0b] flex flex-col`} role="img" aria-label={`${card.name} (no image)`}>
        <div className="h-1.5 shrink-0" style={{ background: frameGradient(card.colors) }} />
        <span className="m-auto px-2 text-center text-[10px] text-gray-500">No image</span>
      </div>
    );
  }
  return (
    <a href={large} target="_blank" rel="noreferrer" className={`${box} block bg-[#0b0b0b]`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- cached card image, already sized */}
      <img src={src} alt={card.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
    </a>
  );
}
