import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// Next.js 16 removed `next lint`, so `npm run lint` runs the ESLint CLI on
// this flat config. The rule set is still `next/core-web-vitals`.
export default defineConfig([
  ...nextCoreWebVitals,
  {
    // eslint-plugin-react-hooks 7 (bundled with eslint-config-next 16) adds
    // React Compiler rules. The existing hydration-safe effects (theme,
    // reduced motion, admin URL state) trip them. Moving those components to
    // the new patterns is a behaviour change, so it is a follow-up, not part
    // of the Next.js upgrade.
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
