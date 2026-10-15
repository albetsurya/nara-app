"use client";

import { useEffect } from "react";
import { Pip } from "@/components/pip/Pip";
import { useLang } from "@/lib/i18n";

/** Friendly fallback instead of a blank screen when a route crashes. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLang();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Pip pose="sleepy" size={110} motion="none" />
      <h1 className="h-display mt-3">{t.crash.title}</h1>
      <p className="subcopy">{t.crash.sub}</p>
      <button onClick={reset} className="btn-primary mt-5 w-full max-w-xs">
        {t.crash.retry}
      </button>
    </main>
  );
}
