"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useSignOut() {
  const router = useRouter();
  const qc = useQueryClient();
  return async () => {
    await createClient().auth.signOut();
    qc.clear();
    // Don't leave one person's cached entries on a shared device.
    if ("caches" in window) await caches.delete("nara-journals");
    localStorage.removeItem("nara:queue");
    router.replace("/onboarding");
  };
}
