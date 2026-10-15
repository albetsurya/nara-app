import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server client for Server Components, Route Handlers and Server Actions. */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return createServerClient("", "", { cookies: { getAll: () => [], setAll: () => {} } });

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => {
        try { return cookieStore.getAll(); } catch { return []; }
      },
      setAll(list: Array<{ name: string; value: string; options?: any }>) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* called from a Server Component: middleware refreshes the session instead */
        }
      },
    },
  });
}

// Minimal placeholder client for static generation that might trigger client calls
export const createStaticClient = () => createServerClient("", "", { cookies: { getAll: () => [], setAll: () => {} } });
