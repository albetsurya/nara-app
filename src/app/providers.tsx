"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
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
    sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [client]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={client}>
        <LanguageProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LanguageProvider>
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
