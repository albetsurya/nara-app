"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueue } from "@/lib/offlineQueue";
import { fetchProfile, fetchRecentJournals, keys } from "@/lib/queries";
import { decryptMaybe, encryptWithSession } from "@/lib/vaultCrypto";
import type { Journal, NewJournal } from "@/lib/types";

export const useRecentJournals = () => {
  const sb = createClient();
  return useQuery({ queryKey: keys.recent, queryFn: () => fetchRecentJournals(sb) });
};

export const useProfile = () => {
  const sb = createClient();
  return useQuery({ queryKey: keys.profile, queryFn: () => fetchProfile(sb) });
};

export const useJournalEntry = (id: string) => {
  const sb = createClient();
  return useQuery({
    queryKey: ["journals", "detail", id],
    queryFn: async () => {
      const { data, error } = await sb.from("journals").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...(data as Journal), content: await decryptMaybe((data as Journal).content) };
    },
  });
};

/** Toggle the gratitude-jar flag on one entry. */
export function useToggleGratitude() {
  const sb = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await sb.from("journals").update({ is_gratitude: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journals"] });
    },
  });
}

/** Saves to Supabase; if offline (or the request fails on a flaky connection) the entry is queued instead. */
export function useSaveJournal() {
  const sb = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entry: NewJournal): Promise<{ queued: boolean }> => {
      // Vault on: ciphertext leaves the device; locked state fails loudly instead of leaking.
      const payload = { ...entry, content: await encryptWithSession(entry.content) };
      if (!navigator.onLine) { enqueue(payload); return { queued: true }; }
      const { error } = await sb.from("journals").insert(payload);
      if (error) {
        // Network-level failures surface as fetch errors; keep the writing safe.
        if (error.message?.toLowerCase().includes("fetch")) { enqueue(payload); return { queued: true }; }
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
