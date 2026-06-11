const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  // Coverage is measured over the whole src tree, not just files that happen
  // to be imported by tests. Exclusions are deliberate and documented:
  // - *.stories.tsx: Storybook-only, exercised by visual regression instead
  // - src/types: type declarations, no runtime code
  // - src/app/projects: self-contained interactive demo showcases
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.stories.tsx",
    "!src/types/**",
    "!src/app/projects/**",
  ],
  // Ratchet floor: set just below the real measured numbers (58/68/63/59 as
  // of v1.2.2) so CI fails on regressions. Raise these as coverage grows —
  // never lower them. The 0% files are Next.js glue (page.tsx wrappers,
  // layouts, middleware) exercised by the Playwright e2e suite instead.
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 60,
      lines: 55,
      statements: 55,
    },
  },
};

// next/jest hardcodes '/node_modules/' into transformIgnorePatterns, but
// next-intl ships untranspiled ESM — exempt it so Jest can transform it.
module.exports = async () => {
  const jestConfig = await createJestConfig(config)();
  jestConfig.transformIgnorePatterns = [
    "/node_modules/(?!(next-intl|use-intl)/)",
    ...(jestConfig.transformIgnorePatterns || []).filter(
      (pattern) => pattern !== "/node_modules/"
    ),
  ];
  return jestConfig;
};
