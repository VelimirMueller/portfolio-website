import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  to?: string;
  onClick?: () => void;
  external?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  to = '',
  onClick,
  external = false
}: ButtonProps) => {
  const baseStyle = "inline-flex items-center justify-center font-mono text-xs md:text-sm font-bold tracking-tight transition-all duration-200 rounded-full px-6 py-3 border";

  const variants = {
    primary: "bg-black text-white border-transparent hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 hover:scale-[1.02]",
    secondary: "bg-gray-100 text-black border-gray-200 hover:bg-gray-200 dark:bg-[#222] dark:text-white dark:border-[#333] dark:hover:bg-[#333]",
    outline: "bg-transparent text-black border-black/10 hover:border-black/30 hover:bg-black/5 dark:text-white dark:border-white/20 dark:hover:border-white dark:hover:bg-white/5",
    ghost: "bg-transparent text-gray-500 border-transparent hover:text-black hover:bg-black/5 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
  };

  const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

  if (to) {
    if (external) {
      return (
        <a href={to} target="_blank" rel="noopener noreferrer" className={combinedClassName}>
          {children}
        </a>
      );
    }
    return (
      <Link href={to} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
};
