import React, { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '../src/components/theme/ThemeProvider';
import deMessages from '../src/locales/de.json';
import enMessages from '../src/locales/en.json';
import '../src/app/globals.css';

const messages: Record<string, typeof deMessages> = { de: deMessages, en: enMessages };

const withProviders: Decorator = (Story, context) => {
  const selectedTheme = (context.globals.theme as string) || 'dark';
  const selectedLocale = (context.globals.locale as string) || 'de';

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
  }, [selectedTheme]);

  return (
    <NextIntlClientProvider locale={selectedLocale} messages={messages[selectedLocale]}>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </NextIntlClientProvider>
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
    locale: {
      name: 'Locale',
      description: 'Toggle language',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'de', title: 'Deutsch' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
    locale: 'de',
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
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
    docs: {
      toc: true,
    },
  },
  tags: ['autodocs'],
};

export default preview;
