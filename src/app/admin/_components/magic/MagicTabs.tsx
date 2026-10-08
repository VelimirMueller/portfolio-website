'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin/magic', label: 'Pool', exact: true },
  { href: '/admin/magic/decks', label: 'Decks', exact: false },
  { href: '/admin/magic/add', label: 'Add card', exact: true },
] as const;

export function MagicTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Magic sections" className="flex flex-wrap gap-2 border-b border-[#222] pb-4">
      {TABS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              active ? 'bg-blue-600/10 text-blue-400' : 'text-gray-500 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
