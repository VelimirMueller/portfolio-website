import type { SupabaseClient } from '@supabase/supabase-js';
import type { TrafficEvent } from './traffic';

/** PostgREST returns at most this many rows per request (Supabase default max-rows). */
const PAGE_SIZE = 1000;
/** Upper bound per dashboard load; computeTraffic handles this in well under a second. */
export const MAX_EVENTS = 50_000;

const COLUMNS = 'created_at, type, visitor, path, prev_path, referrer, target, country, device, browser';

export interface LoadedEvents {
  events: TrafficEvent[];
  /** True when MAX_EVENTS was hit and older events in the window were left out. */
  capped: boolean;
  error: boolean;
}

/**
 * When the newest stored event happened, or null when none ever was. Tells
 * "collection not set up" apart from "no visitors in the chosen period".
 */
export async function loadLastEventAt(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase
    .from('analytics_events')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { created_at: string } | null)?.created_at ?? null;
}

/**
 * All events since `since`, newest first, paged through PostgREST's row limit.
 * Newest first so that, if the cap is hit, it is the oldest part of the
 * comparison window that goes missing — not today.
 */
export async function loadTrafficEvents(supabase: SupabaseClient, since: Date): Promise<LoadedEvents> {
  const events: TrafficEvent[] = [];
  for (let from = 0; from < MAX_EVENTS; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select(COLUMNS)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .range(from, Math.min(from + PAGE_SIZE, MAX_EVENTS) - 1);
    if (error) return { events, capped: false, error: true };
    const rows = (data ?? []) as TrafficEvent[];
    events.push(...rows);
    if (rows.length < PAGE_SIZE) return { events, capped: false, error: false };
  }
  return { events, capped: true, error: false };
}
