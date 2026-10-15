"use client";

import { useEffect } from "react";
import { Pip } from "@/components/pip/Pip";
import { useLang } from "@/lib/i18n";

/** Same friendly fallback inside the signed-in shell (bottom nav stays). */
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
    <main className="flex flex-col items-center px-2 py-10 text-center">
      <Pip pose="sleepy" size={110} motion="none" />
      <h1 className="h-display mt-3">{t.crash.title}</h1>
      <p className="subcopy">{t.crash.sub}</p>
      <button onClick={reset} className="btn-primary mt-5 w-full">
        {t.crash.retry}
      </button>
    </main>
  );
}
