import type { StorybookConfig } from '@storybook/experimental-nextjs-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/experimental-nextjs-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    // staticDirs already copies ../public into storybook-static. Vite's own
    // publicDir copy of the same folder ran in parallel and raced on mkdir
    // (EEXIST './storybook-static/games/cyberpunk', CI on main 2026-10-02).
    config.publicDir = false;

    config.resolve = config.resolve || {};
    // Vite aliases can be an array or object — normalise to array for safe merging
    const existing = config.resolve.alias;
    const aliasArray: Array<{ find: string | RegExp; replacement: string }> = Array.isArray(existing)
      ? existing
      : Object.entries(existing || {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }));

    aliasArray.push(
      { find: '@', replacement: path.resolve(__dirname, '../src') },
    );

    config.resolve.alias = aliasArray;
    return config;
  },
};

export default config;
