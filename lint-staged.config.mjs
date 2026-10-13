// Runs on `git commit` through .husky/pre-commit (issue #188): the same lint and
// type check as CI, so a lint error does not cost a full CI run.
const config = {
  '*.{js,jsx,mjs,cjs,ts,tsx}': 'eslint --no-warn-ignored',
  // tsc checks the whole project (about 3 s), so it runs once, not per file.
  '*.{ts,tsx}': () => 'tsc --noEmit',
};

export default config;
