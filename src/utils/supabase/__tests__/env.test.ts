/** @jest-environment node */
import { supabaseEnv } from '../env';

describe('supabaseEnv', () => {
  const env = process.env;
  afterEach(() => {
    process.env = env;
  });

  it('returns the URL and the publishable key', () => {
    process.env = { ...env, NEXT_PUBLIC_SUPABASE_URL: 'https://p.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'pk' };
    expect(supabaseEnv()).toEqual({ url: 'https://p.supabase.co', key: 'pk' });
  });

  it('names every missing variable', () => {
    process.env = { ...env, NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: undefined };
    expect(() => supabaseEnv()).toThrow(
      'Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY not set (see .env.example).'
    );
  });

  it('names the one missing variable', () => {
    process.env = { ...env, NEXT_PUBLIC_SUPABASE_URL: 'https://p.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: '' };
    expect(() => supabaseEnv()).toThrow('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY not set');
  });
});
