import React, { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { ThemeProvider } from '../src/components/theme/ThemeProvider';
import { LanguageProvider } from '../src/components/language/LanguageProvider';
import '../src/app/globals.css';

const withProviders: Decorator = (Story, context) => {
  const selectedTheme = (context.globals.theme as string) || 'dark';

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
  }, [selectedTheme]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Story />
      </LanguageProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Toggle dark / light mode',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '812px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
        wide: {
          name: 'Wide Desktop',
          styles: { width: '1536px', height: '900px' },
        },
      },
    },
    backgrounds: { disable: true },
    docs: {
      toc: true,
    },
  },
  tags: ['autodocs'],
};

export default preview;
