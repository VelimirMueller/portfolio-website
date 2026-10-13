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
  {
    // eslint-plugin-react-hooks 7 (bundled with eslint-config-next 16) adds
    // React Compiler rules. These existing components trip them with
    // hydration-safe effects (theme, reduced motion, admin URL state).
    // Rewriting them is a behaviour change, so it is a follow-up, not part of
    // the Next.js upgrade. New files get the rules.
    files: [
      'src/components/theme/ThemeProvider.tsx',
      'src/components/organisms/Navigation.tsx',
      'src/hooks/useReducedMotion.ts',
      'src/app/[[]locale]/(main)/contact/ContactContent.tsx',
      'src/app/admin/_components/InboxWorkspace.tsx',
      'src/app/admin/_components/kpi/charts.tsx',
      'src/app/admin/_components/traffic/CommandPalette.tsx',
      'src/app/admin/_components/traffic/hooks.ts',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
    },
  },
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
