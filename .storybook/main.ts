import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Storybook 10 loads main.ts as ESM, so CommonJS __dirname is not defined.
const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-links', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
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
      { find: '@', replacement: path.resolve(dirname, '../src') },
      // Next.js 16.4 + Storybook 10.6: see next-redirect-boundary.tsx.
      // Matches only the exact specifier Storybook's router decorator uses.
      {
        find: /^next\/dist\/client\/components\/redirect-boundary\.js$/,
        replacement: path.resolve(dirname, 'next-redirect-boundary.tsx'),
      },
    );

    config.resolve.alias = aliasArray;
    return config;
  },
};

export default config;
