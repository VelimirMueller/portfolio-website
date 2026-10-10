/** Toggle chip for the pool filters. */
export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        active
          ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
          : 'text-gray-500 border-[#222] hover:text-white hover:border-[#333]'
      }`}
    >
      {children}
    </button>
  );
}
