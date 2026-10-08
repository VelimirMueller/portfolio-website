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
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        active
          ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
          : 'text-gray-500 border-[#222] hover:text-white hover:border-[#333]'
      }`}
    >
      {children}
    </button>
  );
}
