import type { CSSProperties, ReactNode } from 'react';
import type { MessageStatus } from '../_lib/messages';
import { initials } from '../_lib/inbox';

// Visual vocabulary copied from the CRM demo (src/app/projects/dashboard-demo)
// so the admin reads as the same product. Keep class strings in sync with it.

export const Card = ({
  children,
  className = '',
  style,
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** No inner padding, for cards whose content (tables, lists) bleeds to the edge. */
  flush?: boolean;
}) => (
  <div
    className={`bg-[#111111] rounded-[2rem] ${flush ? '' : 'p-6'} border border-[#222] hover:border-[#333] transition-colors ${className}`}
    style={style}
  >
    {children}
  </div>
);

export type BadgeColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'emerald'
  | 'cyan'
  | 'pink'
  | 'amber'
  | 'gray';

const BADGE_STYLES: Record<BadgeColor, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export const Badge = ({ children, color = 'blue' }: { children: ReactNode; color?: BadgeColor }) => (
  <span
    className={`px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wide ${BADGE_STYLES[color]}`}
  >
    {children}
  </span>
);

export const STATUS_COLOR: Record<MessageStatus, BadgeColor> = {
  new: 'blue',
  read: 'green',
  archived: 'purple',
  spam: 'red',
};

export const StatusBadge = ({ status }: { status: MessageStatus }) => (
  <Badge color={STATUS_COLOR[status]}>{status}</Badge>
);

export const Avatar = ({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) => (
  <div
    aria-hidden="true"
    className={`${
      size === 'lg' ? 'w-12 h-12 rounded-2xl text-sm' : 'w-7 h-7 rounded-lg text-[10px]'
    } shrink-0 bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center font-bold text-white`}
  >
    {initials(name)}
  </div>
);
