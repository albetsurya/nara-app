"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { flushQueue } from "@/lib/offlineQueue";
import { LanguageProvider } from "@/lib/i18n";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } }));

  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      const sent = await flushQueue(createClient());
      if (sent) { client.invalidateQueries({ queryKey: ["journals"] }); client.invalidateQueries({ queryKey: ["stamps"] }); }
    };
    const onMessage = (e: MessageEvent) => {
      if ((e.data as { type?: string } | null)?.type === "nara-flush") sync();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    sync();
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", onVisible);
    try {
      navigator.serviceWorker?.addEventListener("message", onMessage);
    } catch {
      // service worker unsupported — online/visibility flush still applies
    }
    return () => {
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", onVisible);
      try {
        navigator.serviceWorker?.removeEventListener("message", onMessage);
      } catch {
        // ignore
      }
    };
  }, [client]);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={client}>
          <LanguageProvider>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </LanguageProvider>
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
