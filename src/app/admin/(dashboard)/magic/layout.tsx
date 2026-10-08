import { MagicTabs } from '@/app/admin/_components/magic/MagicTabs';

export default function MagicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Magic</h1>
        <p className="text-gray-500 text-sm">My cards, my decks, and every card ever printed</p>
      </div>
      <MagicTabs />
      {children}
    </div>
  );
}
