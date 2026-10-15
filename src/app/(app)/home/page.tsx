import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { HomeView } from "@/components/home/HomeView";
import { createClient } from "@/lib/supabase/server";
import { fetchProfile, fetchRecentJournals, keys } from "@/lib/queries";

export const metadata = { title: "Home" };

/** Prefetch on the server, hand the cache to the client. staleTime (60s) stops an instant refetch. */
export default async function HomePage() {
  const qc = new QueryClient();
  const sb = await createClient();
  try {
    await Promise.all([
      qc.prefetchQuery({ queryKey: keys.profile, queryFn: () => fetchProfile(sb) }),
      qc.prefetchQuery({ queryKey: keys.recent, queryFn: () => fetchRecentJournals(sb) }),
    ]);
  } catch {
    // ignore fetch errors during build/static rendering if env is missing
  }
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <HomeView />
    </HydrationBoundary>
  );
}
