import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// Next.js 16 removed `next lint`, so `npm run lint` runs the ESLint CLI on
// this flat config. The rule set is still `next/core-web-vitals`.
//
// ESLint 10: eslint-config-next 16.4 supports it (vercel/next.js#99628). It
// patches eslint-plugin-react, eslint-plugin-import and its Babel parser for
// the APIs ESLint 10 removed. These two plugins and eslint-plugin-jsx-a11y do
// not list ESLint 10 as a peer yet, so `npm ci` prints three
// "ERESOLVE overriding peer dependency" warnings. They are expected.
export default defineConfig([
  ...nextCoreWebVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'storybook-static/**',
    'next-env.d.ts',
    // Figma plugin scripts (vfb design pack), not React code.
    '.figma/**',
  ]),
]);
