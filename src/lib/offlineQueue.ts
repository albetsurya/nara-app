import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewJournal } from "./types";

/** Offline-first writing: entries saved without a connection wait here, then sync. */
const KEY = "nara:queue";
type Queued = NewJournal & { created_at: string };

const read = (): Queued[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
};
const write = (q: Queued[]) => localStorage.setItem(KEY, JSON.stringify(q));

export const queuedCount = () => read().length;

export function enqueue(entry: NewJournal) {
  write([...read(), { ...entry, created_at: entry.created_at ?? new Date().toISOString() }]);
}

/** Sends queued entries oldest-first; stops at the first failure and keeps the rest. Returns how many synced. */
export async function flushQueue(sb: SupabaseClient) {
  const q = read();
  let sent = 0;
  for (const item of q) {
    const { error } = await sb.from("journals").insert(item);
    if (error) break;
    sent++;
  }
  if (sent) write(q.slice(sent));
  return sent;
}
