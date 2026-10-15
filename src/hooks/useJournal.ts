"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueue } from "@/lib/offlineQueue";
import { fetchProfile, fetchRecentJournals, keys } from "@/lib/queries";
import type { NewJournal } from "@/lib/types";

export const useRecentJournals = () => {
  const sb = createClient();
  return useQuery({ queryKey: keys.recent, queryFn: () => fetchRecentJournals(sb) });
};

export const useProfile = () => {
  const sb = createClient();
  return useQuery({ queryKey: keys.profile, queryFn: () => fetchProfile(sb) });
};

/** Saves to Supabase; if offline (or the request fails on a flaky connection) the entry is queued instead. */
export function useSaveJournal() {
  const sb = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entry: NewJournal): Promise<{ queued: boolean }> => {
      if (!navigator.onLine) { enqueue(entry); return { queued: true }; }
      const { error } = await sb.from("journals").insert(entry);
      if (error) {
        // Network-level failures surface as fetch errors; keep the writing safe.
        if (error.message?.toLowerCase().includes("fetch")) { enqueue(entry); return { queued: true }; }
        throw error;
      }
      return { queued: false };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journals"] });
      qc.invalidateQueries({ queryKey: ["stamps"] });
    },
  });
}
