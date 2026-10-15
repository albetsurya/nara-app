import { createBrowserClient } from "@supabase/ssr";

/** Browser client. createBrowserClient is a singleton, so calling this is cheap. */
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createBrowserClient(url, key);
};
