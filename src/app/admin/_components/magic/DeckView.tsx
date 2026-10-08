import { AlertTriangle } from 'lucide-react';
import { Badge, Card } from '../ui';
import { CardImage } from './CardImage';
import { ManaCost } from './ManaCost';
import { deckWarnings, shoppingList, type DeckAnalysis, type DeckLine } from '../../_lib/magic/deck';
import type { CatalogCard, Deck, DeckCard } from '../../_lib/magic/types';

const eur = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

/** "owned 4/4", "1/3 · buy 2", "buy 4" — one chip per deck row. */
export function OwnershipBadge({ line }: { line: DeckLine }) {
  if (line.missing === 0) return <Badge color="green">owned {line.owned}/{line.qty}</Badge>;
  if (line.owned === 0) return <Badge color="red">buy {line.missing}</Badge>;
  return (
    <Badge color="orange">
      {line.owned}/{line.qty} · buy {line.missing}
    </Badge>
  );
}

function CardCell({ card }: { card: CatalogCard }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <CardImage card={card} className="w-10" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">{card.name}</span>
          <ManaCost cost={card.mana_cost} />
        </div>
        <div className="text-[11px] text-gray-500 truncate">{card.type_line}</div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

const th = 'text-left text-[10px] font-mono uppercase tracking-wider text-gray-500 font-normal px-4 py-3';
const td = 'px-4 py-3 align-middle';
const table = 'w-full text-sm table-fixed sm:table-auto';

/** Main deck or sideboard table. On phones the detail and the pool badge move under the card. */
function LinesTable({ lines, detail }: { lines: DeckLine[]; detail: (l: DeckLine) => React.ReactNode }) {
  return (
    <Card flush className="overflow-x-auto">
      <table className={table}>
        <thead className="border-b border-[#222]">
          <tr>
            <th className={`${th} w-14`}>Qty</th>
            <th className={th}>Card</th>
            <th className={`${th} hidden lg:table-cell`}>Plan</th>
            <th className={`${th} hidden sm:table-cell`}>Pool</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {lines.map((line) => (
            <tr key={line.id}>
              <td className={`${td} font-mono text-white`}>{line.qty}</td>
              <td className={td}>
                <CardCell card={line.card} />
                <p className="lg:hidden mt-1 text-xs text-gray-500">{detail(line)}</p>
                <div className="sm:hidden mt-2">
                  <OwnershipBadge line={line} />
                </div>
              </td>
              <td className={`${td} hidden lg:table-cell text-gray-400 text-xs max-w-sm`}>{detail(line)}</td>
              <td className={`${td} hidden sm:table-cell`}>
                <OwnershipBadge line={line} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function UpgradesTable({ upgrades }: { upgrades: DeckCard[] }) {
  return (
    <Card flush className="overflow-x-auto">
      <table className={table}>
        <thead className="border-b border-[#222]">
          <tr>
            <th className={`${th} w-14`}>Step</th>
            <th className={th}>Card</th>
            <th className={th}>Replaces</th>
            <th className={`${th} hidden lg:table-cell`}>Why</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {upgrades.map((u) => (
            <tr key={u.id}>
              <td className={`${td} font-mono text-white`}>{u.position}</td>
              <td className={td}>
                <CardCell card={u.card} />
                <p className="lg:hidden mt-1 text-xs text-gray-500">{u.note}</p>
              </td>
              <td className={`${td} text-gray-400 text-xs`}>{u.swap_out}</td>
              <td className={`${td} hidden lg:table-cell text-gray-400 text-xs max-w-sm`}>{u.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function DeckView({ deck, analysis }: { deck: Deck; analysis: DeckAnalysis }) {
  const { totals } = analysis;
  const warnings = deckWarnings(deck, analysis);
  const toBuy = shoppingList(analysis);
  const priced = toBuy.every((i) => i.eur !== null);
  const budget = toBuy.reduce((n, i) => n + (i.eur ?? 0), toBuy.length ? deck.shipping_eur : 0);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white">{deck.name}</h2>
        {deck.summary && <p className="text-sm text-gray-400 max-w-3xl">{deck.summary}</p>}
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Main deck', `${totals.main}/${deck.main_size}`],
          ['Sideboard', `${totals.sideboard}/${deck.sideboard_size}`],
          ['Owned', `${totals.owned}/${totals.main + totals.sideboard}`],
          ['Still to buy', String(totals.missing)],
        ].map(([label, value]) => (
          <Card key={label}>
            <dt className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</dt>
            <dd className="text-2xl font-bold text-white mt-1">{value}</dd>
          </Card>
        ))}
      </dl>

      {warnings.length > 0 && (
        <Card className="border-amber-500/30">
          <h3 className="flex items-center gap-2 text-sm font-bold text-amber-300 mb-2">
            <AlertTriangle size={16} aria-hidden="true" /> Check the plan
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-amber-200/90">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Card>
      )}

      <Section title="Main deck" subtitle={`${totals.main} cards`}>
        <LinesTable lines={analysis.main} detail={(l) => l.note} />
      </Section>

      {analysis.sideboard.length > 0 && (
        <Section title="Sideboard" subtitle="Swap in after game one">
          <LinesTable lines={analysis.sideboard} detail={(l) => `${l.note} · out: ${l.swap_out ?? '—'}`} />
        </Section>
      )}

      <Section
        title="Still to buy"
        subtitle={toBuy.length ? `About ${eur(budget)} incl. ${eur(deck.shipping_eur)} shipping${priced ? '' : ' · some prices missing'}` : undefined}
      >
        <Card flush>
          {toBuy.length ? (
            <ul className="divide-y divide-[#1a1a1a] text-sm">
              {toBuy.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <span className="text-white">{item.name}</span>
                  <span className="flex gap-4 font-mono text-gray-400">
                    <span>×{item.qty}</span>
                    <span className="w-20 text-right">{item.eur === null ? '—' : eur(item.eur)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-green-400">You own every card of the deck.</p>
          )}
        </Card>
      </Section>

      {analysis.upgrades.length > 0 && (
        <Section title="Upgrade path" subtitle="Only after the deck works · one step at a time">
          <UpgradesTable upgrades={analysis.upgrades} />
        </Section>
      )}
    </div>
  );
}
