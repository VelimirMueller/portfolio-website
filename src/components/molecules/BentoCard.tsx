import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  noPadding?: boolean;
}

export const BentoCard = ({
  children,
  className = '',
  title,
  subtitle,
  icon: Icon,
  noPadding = false
}: BentoCardProps) => (
  <div className={`bento-card bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-[1.5rem] overflow-hidden relative flex flex-col group shadow-sm dark:shadow-none ${className}`}>

    {/* Inner Highlight Border for depth */}
    <div className="absolute inset-0 rounded-[1.5rem] border border-white/50 dark:border-white/5 pointer-events-none z-20"></div>

    {(title || subtitle || Icon) && (
      <div className="p-6 pb-2 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            {subtitle && <span className="text-brand-600 dark:text-brand-500 text-[10px] md:text-xs font-mono uppercase tracking-widest block mb-2 flex items-center gap-2 font-bold">
              {subtitle}
            </span>}
            {title && <h3 className="text-xl md:text-2xl font-mono font-bold text-light-text dark:text-dark-text leading-tight mt-1">{title}</h3>}
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border group-hover:scale-110 transition-transform duration-300">
              <Icon className="text-light-sub dark:text-dark-sub group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors duration-300" size={20} />
            </div>
          )}
        </div>
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6 pt-2'} flex-grow relative z-10`}>{children}</div>
  </div>
);
