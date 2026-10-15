import type { SupabaseClient } from "@supabase/supabase-js";
import type { Journal, Profile, Stamp } from "./types";

/** One place for query keys + fetchers, shared by server prefetching and client hooks. */
export const keys = {
  profile: ["profile"] as const,
  recent: ["journals", "recent"] as const,
  stamps: (page: number, size: number) => ["stamps", page, size] as const,
};

export const DAILY_GOAL_SECONDS = 5 * 60;

export async function fetchProfile(sb: SupabaseClient): Promise<Profile | null> {
  const { data, error } = await sb.from("profiles").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

/** Last 30 entries. Timezone-independent, so it is safe to prefetch on the server;
 *  "today's minutes" is derived from this on the client in the user's local day. */
export async function fetchRecentJournals(sb: SupabaseClient): Promise<Journal[]> {
  const { data, error } = await sb.from("journals").select("*").order("created_at", { ascending: false }).limit(30);
  if (error) throw error;
  return data ?? [];
}

/** Server-side pagination: only the requested range leaves the database. */
export async function fetchStampsPage(sb: SupabaseClient, page: number, size: number) {
  const from = page * size;
  const { data, error, count } = await sb
    .from("stamps")
    .select("*", { count: "exact" })
    .order("earned_at", { ascending: false })
    .range(from, from + size - 1);
  if (error) throw error;
  return { rows: (data ?? []) as Stamp[], total: count ?? 0 };
}

export function secondsWrittenToday(entries: Journal[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return entries.filter((e) => new Date(e.created_at) >= start).reduce((s, e) => s + e.duration_seconds, 0);
}
