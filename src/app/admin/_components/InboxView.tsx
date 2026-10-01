import Link from 'next/link';
import { Search } from 'lucide-react';
import { filterMessages, summarize, timeAgo } from '../_lib/inbox';
import type { ContactMessage, MessageStatus } from '../_lib/messages';
import { StatCard } from './StatCard';
import { Avatar, Card, StatusBadge } from './ui';

export function InboxView({
  all,
  filter,
  query,
  error,
  now,
}: {
  all: ContactMessage[];
  filter: MessageStatus | 'all';
  query: string;
  error: boolean;
  now?: Date;
}) {
  const stats = summarize(all, now);
  const messages = filterMessages(all, filter, query);
  const title = query ? `Results for “${query}”` : filter === 'all' ? 'All messages' : `${filter[0].toUpperCase()}${filter.slice(1)} messages`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
          <p className="text-gray-500 text-sm">Messages from the contact form</p>
        </div>
        <Link
          href={filter === 'all' ? '/admin' : '/admin?status=all'}
          className="self-start sm:self-auto px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold rounded-xl border border-[#333] hover:bg-[#222]"
        >
          {filter === 'all' ? 'Show unread' : 'Show all'}
        </Link>
      </div>

      <form action="/admin" method="get" role="search" className="relative md:hidden">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} aria-hidden="true" />
        <input type="hidden" name="status" value={filter} />
        <input
          type="search"
          name="q"
          defaultValue={query}
          aria-label="Search messages"
          placeholder="Search messages..."
          className="w-full bg-[#111] border border-[#222] rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </form>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.status} {...s} active={s.status === filter} index={i} />
        ))}
      </div>

      <Card flush className="overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex justify-between items-center p-6 pb-0">
          <h2 className="text-sm font-bold text-white">{title}</h2>
          {query && (
            <Link href={`/admin?status=${filter}`} className="text-[10px] text-blue-400 font-bold hover:text-blue-300">
              Clear search
            </Link>
          )}
        </div>

        {error && (
          <p role="alert" className="px-6 py-8 text-sm text-red-400">
            Could not load messages.
          </p>
        )}
        {!error && messages.length === 0 && (
          <p className="px-6 py-10 text-sm text-gray-500 text-center">No messages here.</p>
        )}

        {messages.length > 0 && (
          <>
            {/* Mobile card layout */}
            <ul className="md:hidden p-4 space-y-3 mt-2">
              {messages.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/${m.id}`} className="block p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333]">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={m.name} />
                        <div className="min-w-0">
                          <div className={`text-xs truncate ${m.status === 'new' ? 'font-bold text-white' : 'text-gray-300'}`}>{m.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{m.email}</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-600 font-mono whitespace-nowrap">{timeAgo(m.created_at, now)}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{m.message}</p>
                    <StatusBadge status={m.status} />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop table layout */}
            <div className="w-full overflow-x-auto hidden md:block">
              <table className="w-full text-left mt-4">
                <thead>
                  <tr className="border-b border-[#222] text-[10px] text-gray-500 uppercase font-mono">
                    <th scope="col" className="px-6 py-3 font-medium">From</th>
                    <th scope="col" className="px-6 py-3 font-medium">Message</th>
                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                    <th scope="col" className="px-6 py-3 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {messages.map((m) => (
                    <tr key={m.id} className="hover:bg-[#1a1a1a] transition-colors relative">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {m.status === 'new' && <span className="absolute left-2 w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />}
                          <Avatar name={m.name} />
                          <div className="min-w-0">
                            <Link href={`/admin/${m.id}`} className={`text-xs after:absolute after:inset-0 ${m.status === 'new' ? 'font-bold text-white' : 'text-gray-300'}`}>
                              {m.name}
                            </Link>
                            <div className="text-[10px] text-gray-500">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-400 max-w-md">
                        <span className="line-clamp-1">{m.message}</span>
                      </td>
                      <td className="px-6 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-6 py-3 text-[10px] text-gray-500 font-mono whitespace-nowrap">{timeAgo(m.created_at, now)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="px-6 py-3 border-t border-[#222] bg-[#0a0a0a] flex justify-between text-xs">
          <span className="text-gray-500">Showing</span>
          <span className="font-mono font-bold text-white">
            {messages.length} / {all.length}
          </span>
        </div>
      </Card>
    </div>
  );
}
