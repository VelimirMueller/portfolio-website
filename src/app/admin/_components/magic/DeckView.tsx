import { AlertTriangle } from 'lucide-react';
import { Badge, Card } from '../ui';
import { CardImage, ManaCost } from './parts';
import type { CatalogCard, ManaColor } from '../../_lib/magic/collection';
import { offColor, type DeckLine, type DeckPlan, type deckOwnership } from '../../_lib/magic/deck';

type Ownership = ReturnType<typeof deckOwnership>;
type CardInfo = Pick<CatalogCard, 'name' | 'mana_cost' | 'type_line' | 'colors' | 'image_url'>;

const eur = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

/** "4/4 owned", "1 of 3 · buy 2", "buy 4" — one chip per deck row. */
export function OwnershipBadge({ line }: { line: DeckLine }) {
  if (line.missing === 0) return <Badge color="green">owned {line.owned}/{line.qty}</Badge>;
  if (line.owned === 0) return <Badge color="red">buy {line.missing}</Badge>;
  return (
    <Badge color="orange">
      {line.owned}/{line.qty} · buy {line.missing}
    </Badge>
  );
}

function CardCell({ name, label, info }: { name: string; label?: string; info?: CardInfo }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <CardImage name={name} url={info?.image_url ?? null} colors={info?.colors ?? []} className="w-10" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">{name}</span>
          <ManaCost cost={info?.mana_cost ?? null} />
        </div>
        <div className="text-[11px] text-gray-500 truncate">
          {label ? <span className="italic">{label} · </span> : null}
          {info?.type_line}
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle && <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

const th = 'text-left text-[10px] font-mono uppercase tracking-wider text-gray-500 font-normal px-4 py-3';
const td = 'px-4 py-3 align-middle';

export function DeckView({
  plan,
  ownership,
  cards,
}: {
  plan: DeckPlan;
  ownership: Ownership;
  /** Catalog (or pool) data per card name: image, cost, type, colors. */
  cards: Map<string, CardInfo>;
}) {
  const { totals } = ownership;
  const colorsByName = new Map<string, ManaColor[]>(Array.from(cards, ([n, c]) => [n, c.colors]));
  const allNames = [...plan.main, ...plan.sideboard].map((e) => e.name);
  const offColorNames = offColor(colorsByName, allNames, plan.colors);
  const unknown = allNames.filter((n) => !cards.has(n));

  const warnings = [
    totals.main !== plan.mainSize && `Main deck has ${totals.main} cards, the plan says ${plan.mainSize}.`,
    totals.sideboard !== plan.sideboardSize &&
      `Sideboard has ${totals.sideboard} cards, the plan says ${plan.sideboardSize}.`,
    offColorNames.length > 0 &&
      `Not ${plan.colors.join('')}: ${offColorNames.join(', ')} — the deck cannot cast ${offColorNames.length > 1 ? 'these' : 'this'}.`,
    unknown.length > 0 && `No catalog data yet for: ${unknown.join(', ')}.`,
  ].filter(Boolean) as string[];

  const missingLines = [...ownership.main, ...ownership.sideboard]
    .filter((l) => l.missing > 0)
    .reduce((acc, l) => acc.set(l.name, (acc.get(l.name) ?? 0) + l.missing), new Map<string, number>());
  const planBudget = plan.buy.reduce((n, b) => n + b.eur, plan.shippingEur);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white">{plan.name}</h2>
        <p className="text-sm text-gray-400 max-w-3xl">{plan.summary}</p>
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Main deck', `${totals.main}/${plan.mainSize}`],
          ['Sideboard', `${totals.sideboard}/${plan.sideboardSize}`],
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
        <Card flush className="overflow-x-auto">
          <table className="w-full text-sm table-fixed sm:table-auto">
            <thead className="border-b border-[#222]">
              <tr>
                <th className={`${th} w-14`}>Qty</th>
                <th className={th}>Card</th>
                <th className={`${th} hidden lg:table-cell`}>Job</th>
                <th className={`${th} hidden sm:table-cell`}>Pool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {plan.main.map((entry, i) => (
                <tr key={entry.name}>
                  <td className={`${td} font-mono text-white`}>{entry.qty}</td>
                  <td className={td}>
                    <CardCell name={entry.name} label={entry.label} info={cards.get(entry.name)} />
                    <p className="lg:hidden mt-1 text-xs text-gray-500">{entry.role}</p>
                    <div className="sm:hidden mt-2">
                      <OwnershipBadge line={ownership.main[i]} />
                    </div>
                  </td>
                  <td className={`${td} hidden lg:table-cell text-gray-400 text-xs max-w-sm`}>{entry.role}</td>
                  <td className={`${td} hidden sm:table-cell`}>
                    <OwnershipBadge line={ownership.main[i]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Sideboard" subtitle="Swap in after game one">
        <Card flush className="overflow-x-auto">
          <table className="w-full text-sm table-fixed sm:table-auto">
            <thead className="border-b border-[#222]">
              <tr>
                <th className={`${th} w-14`}>Qty</th>
                <th className={th}>Card</th>
                <th className={`${th} hidden lg:table-cell`}>Against</th>
                <th className={`${th} hidden lg:table-cell`}>Swap out</th>
                <th className={`${th} hidden sm:table-cell`}>Pool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {plan.sideboard.map((entry, i) => (
                <tr key={entry.name}>
                  <td className={`${td} font-mono text-white`}>{entry.qty}</td>
                  <td className={td}>
                    <CardCell name={entry.name} info={cards.get(entry.name)} />
                    <p className="lg:hidden mt-1 text-xs text-gray-500">
                      {entry.against} · out: {entry.swapOut}
                    </p>
                    <div className="sm:hidden mt-2">
                      <OwnershipBadge line={ownership.sideboard[i]} />
                    </div>
                  </td>
                  <td className={`${td} hidden lg:table-cell text-gray-400 text-xs`}>{entry.against}</td>
                  <td className={`${td} hidden lg:table-cell text-gray-400 text-xs`}>{entry.swapOut}</td>
                  <td className={`${td} hidden sm:table-cell`}>
                    <OwnershipBadge line={ownership.sideboard[i]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <div className="grid gap-8 xl:grid-cols-2">
        <Section title="Still to buy" subtitle="Deck minus your pool">
          <Card>
            {missingLines.size ? (
              <ul className="divide-y divide-[#1a1a1a] text-sm">
                {Array.from(missingLines, ([name, qty]) => (
                  <li key={name} className="flex justify-between py-2">
                    <span className="text-white">{name}</span>
                    <span className="font-mono text-gray-400">×{qty}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-400">You own every card of the deck.</p>
            )}
          </Card>
        </Section>

        <Section title="Shopping plan" subtitle={`As planned · about ${eur(planBudget)} incl. shipping buffer`}>
          <Card flush className="overflow-x-auto">
            <table className="w-full text-sm table-fixed sm:table-auto">
              <tbody className="divide-y divide-[#1a1a1a]">
                {plan.buy.map((b) => (
                  <tr key={b.name}>
                    <td className={`${td} font-mono text-white`}>{b.qty}</td>
                    <td className={td}>
                      <div className="text-white">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.role}</div>
                    </td>
                    <td className={`${td} text-right font-mono text-gray-300`}>{eur(b.eur)}</td>
                  </tr>
                ))}
                <tr>
                  <td className={td} />
                  <td className={`${td} text-gray-500`}>Shipping buffer</td>
                  <td className={`${td} text-right font-mono text-gray-300`}>{eur(plan.shippingEur)}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Section>
      </div>

      <Section title="Upgrade path" subtitle="Only after the budget deck works · one step at a time">
        <Card flush className="overflow-x-auto">
          <table className="w-full text-sm table-fixed sm:table-auto">
            <thead className="border-b border-[#222]">
              <tr>
                <th className={`${th} w-14`}>Step</th>
                <th className={th}>Card</th>
                <th className={th}>Replaces</th>
                <th className={`${th} hidden lg:table-cell`}>Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {plan.upgrades.map((u) => (
                <tr key={u.stage}>
                  <td className={`${td} font-mono text-white`}>{u.stage}</td>
                  <td className={td}>
                    <CardCell name={u.name} info={cards.get(u.name)} />
                  </td>
                  <td className={`${td} text-gray-400 text-xs`}>{u.replaces}</td>
                  <td className={`${td} hidden lg:table-cell text-gray-400 text-xs max-w-sm`}>{u.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
    </div>
  );
}
