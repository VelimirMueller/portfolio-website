import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/** A Supabase client typed with the schema from supabase/migrations (src/types/supabase.ts). */
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * The project URL and publishable key. Throws a clear error when one is missing,
 * instead of an unclear one inside the Supabase client (issue #187).
 */
export function supabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  const missing = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL',
    !key && 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  ].filter(Boolean);
  if (!url || !key) {
    throw new Error(`Supabase is not configured: ${missing.join(' and ')} not set (see .env.example).`);
  }
  return { url, key };
}
