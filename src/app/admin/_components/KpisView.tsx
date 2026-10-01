import Link from 'next/link';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { KPI_WINDOW_DAYS, WEEKDAYS, type MessageKpis } from '../_lib/kpis';
import { BarChart, Donut } from './kpi/charts';
import { KpiCard } from './kpi/KpiCard';
import { Card } from './ui';

const STATUS_META = {
  new: { label: 'Unread', color: '#3b82f6' },
  read: { label: 'Read', color: '#22c55e' },
  archived: { label: 'Archived', color: '#a855f7' },
  spam: { label: 'Spam', color: '#f87171' },
} as const;

/**
 * KPI overview. Each data source is one section; Messages is the first.
 * Further sections (traffic, deploys, …) are appended below it.
 */
export function KpisView({ messages, error }: { messages: MessageKpis; error: boolean }) {
  // 5-day buckets: daily counts on a contact form are mostly 0/1 and look like noise.
  const spark = Array.from({ length: Math.ceil(KPI_WINDOW_DAYS / 5) }, (_, i) =>
    messages.daily.slice(i * 5, i * 5 + 5).reduce((sum, d) => sum + d.count, 0)
  );
  const dayLabels = messages.daily.map((d) => `${d.date.slice(8, 10)}.${d.date.slice(5, 7)}.`);
  const busiest = messages.byWeekday.indexOf(Math.max(...messages.byWeekday));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">KPIs</h1>
        <p className="text-gray-500 text-sm">How the site is doing, one section per source</p>
      </div>

      <section aria-labelledby="kpi-messages" className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="kpi-messages" className="text-sm font-bold text-white">Messages</h2>
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Contact form · last {KPI_WINDOW_DAYS} days</p>
          </div>
          <Link href="/admin" className="text-[10px] text-blue-400 font-bold hover:text-blue-300">
            Open inbox
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            Could not load messages.
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label={`Received · ${KPI_WINDOW_DAYS}d`}
            value={messages.current}
            icon="mail"
            color="blue"
            trend={messages.trend}
            trendLabel={messages.previous ? undefined : 'no prior data'}
            sparkline={spark}
            index={0}
          />
          <KpiCard label="Unread" value={messages.unread} icon="inbox" color="purple" trendLabel="waiting" index={1} />
          <KpiCard label="All time" value={messages.total} icon="calendar" color="green" index={2} />
          <KpiCard
            label="Spam rate"
            value={messages.spamRate}
            decimals={1}
            suffix="%"
            icon="shield"
            color="red"
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Messages per day</h3>
                <p className="text-xs text-gray-500">Last {KPI_WINDOW_DAYS} days</p>
              </div>
              {messages.trend !== null && (
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 ${
                    messages.trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {messages.trend >= 0 ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
                  {messages.trend >= 0 ? '+' : ''}
                  {messages.trend}% vs prior {KPI_WINDOW_DAYS}d
                </div>
              )}
            </div>
            <BarChart
              compact
              labelEvery={5}
              values={messages.daily.map((d) => d.count)}
              labels={dayLabels}
              label={`Messages per day over the last ${KPI_WINDOW_DAYS} days, ${messages.current} in total`}
            />
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="text-lg font-bold text-white mb-1">By status</h3>
            <p className="text-xs text-gray-500 mb-4">All {messages.total} messages</p>
            <Donut
              label={messages.byStatus.map((s) => `${STATUS_META[s.status].label} ${s.pct}%`).join(', ')}
              segments={messages.byStatus.map((s) => ({
                label: STATUS_META[s.status].label,
                value: s.count,
                pct: s.pct,
                color: STATUS_META[s.status].color,
              }))}
            />
          </Card>
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Busiest weekdays</h3>
              <p className="text-xs text-gray-500">When people write, all time</p>
            </div>
            {messages.total > 0 && (
              <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-mono">Peak: {WEEKDAYS[busiest]}</span>
            )}
          </div>
          <BarChart values={messages.byWeekday} labels={WEEKDAYS} label={`Messages per weekday: ${WEEKDAYS.map((d, i) => `${d} ${messages.byWeekday[i]}`).join(', ')}`} />
        </Card>
      </section>
    </div>
  );
}
