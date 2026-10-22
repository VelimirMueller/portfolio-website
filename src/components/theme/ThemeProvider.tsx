'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Nothing outside React changes the theme after the first read: a toggle
// goes through React state.
const subscribe = () => () => {};

// Must mirror the no-flash script in the root layouts: saved theme wins,
// an explicit system light preference selects light, anything else stays
// dark. Diverging from the script causes a post-hydration theme flip.
const readStartTheme = (): Theme => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

// One read per provider, on the client: later changes of the system
// preference apply on the next page load, like the no-flash script.
const createStartThemeReader = () => {
  let theme: Theme | null = null;
  return () => (theme ??= readStartTheme());
};
const getServerTheme = (): Theme => 'dark';

// False on the server and during hydration, true after it.
const getMounted = () => true;
const getServerMounted = () => false;

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [getStartTheme] = useState(createStartThemeReader);
  const startTheme = useSyncExternalStore(subscribe, getStartTheme, getServerTheme);
  const mounted = useSyncExternalStore(subscribe, getMounted, getServerMounted);
  const [chosen, setChosen] = useState<Theme | null>(null);
  const theme = chosen ?? startTheme;

  // The no-flash script owns the class until hydration is done. The class
  // drives Tailwind's dark: variant, data-mode drives @synthwerk/tokens.
  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-mode', theme);
  }, [theme, mounted]);

  // Only an explicit user choice is persisted — system-derived defaults must
  // keep following the system.
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    setChosen(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
