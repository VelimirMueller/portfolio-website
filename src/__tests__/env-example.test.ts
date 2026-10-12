/** @jest-environment node */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

// Guards issue #79: every env var the code reads is listed in a template.
// App and scripts -> .env.example; Edge Functions -> supabase/functions/.env.example.

const ROOT = join(__dirname, '..', '..');

// Set by the runtime, never by us.
const RUNTIME_PROVIDED = new Set(['NODE_ENV', 'CI']);
// Supabase injects these into every Edge Function.
const SUPABASE_PROVIDED = new Set(['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_DB_URL']);

// Skips node_modules and every __tests__ dir: tests set fake env values for mocks,
// and those are not names the deployed code reads.
function walk(dir: string, accept: (file: string) => boolean): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === 'node_modules' || name === '__tests__' ? [] : walk(path, accept);
    }
    return accept(path) ? [path] : [];
  });
}

function namesIn(files: string[], patterns: RegExp[]): Map<string, string> {
  const found = new Map<string, string>();
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        if (!found.has(match[1])) found.set(match[1], relative(ROOT, file));
      }
    }
  }
  return found;
}

function templateNames(file: string): Set<string> {
  return new Set(
    readFileSync(join(ROOT, file), 'utf8')
      .split('\n')
      .map((line) => /^([A-Z][A-Z0-9_]*)=/.exec(line.trim())?.[1])
      .filter((name): name is string => !!name),
  );
}

function missing(read: Map<string, string>, listed: Set<string>, ignore: Set<string>): string[] {
  return [...read]
    .filter(([name]) => !listed.has(name) && !ignore.has(name))
    .map(([name, file]) => `${name} (${file})`);
}

const appFiles = [
  ...walk(join(ROOT, 'src'), (f) => /\.(ts|tsx)$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f)),
  ...walk(join(ROOT, 'scripts'), (f) => /\.(mjs|js|ts)$/.test(f)),
  ...readdirSync(ROOT)
    .filter((f) => /^next\.config\.(js|mjs|ts)$/.test(f))
    .map((f) => join(ROOT, f)),
];
const functionFiles = walk(join(ROOT, 'supabase', 'functions'), (f) => /\.(ts|js)$/.test(f));

const APP_PATTERNS = [
  /process\.env\.([A-Z][A-Z0-9_]*)/g,
  /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g,
  // Injected env objects, e.g. loadVercelStats(fetch, env = process.env). Any object
  // named env with an UPPER_CASE key counts; list the name or rename the object.
  /\benv\.([A-Z][A-Z0-9_]*)/g,
];
const FUNCTION_PATTERNS = [/Deno\.env\.get\(\s*['"]([A-Z][A-Z0-9_]*)['"]/g];

describe('.env.example templates', () => {
  const app = templateNames('.env.example');
  const functions = templateNames('supabase/functions/.env.example');

  it('finds the env reads it guards (sanity check for the scan)', () => {
    expect(namesIn(appFiles, APP_PATTERNS).has('NEXT_PUBLIC_SUPABASE_URL')).toBe(true);
    expect(namesIn(appFiles, APP_PATTERNS).has('VERCEL_API_TOKEN')).toBe(true);
    expect(namesIn(functionFiles, FUNCTION_PATTERNS).has('RESEND_API_KEY')).toBe(true);
  });

  it('.env.example lists every env var the app and scripts read', () => {
    expect(missing(namesIn(appFiles, APP_PATTERNS), app, RUNTIME_PROVIDED)).toEqual([]);
  });

  it('supabase/functions/.env.example lists every secret the Edge Functions read', () => {
    expect(missing(namesIn(functionFiles, FUNCTION_PATTERNS), functions, SUPABASE_PROVIDED)).toEqual([]);
  });

  it('keeps Edge Function secrets out of the app template', () => {
    expect([...functions].filter((name) => app.has(name))).toEqual([]);
  });
});
