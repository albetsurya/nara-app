"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { Pip } from "@/components/pip/Pip";
import { useLang } from "@/lib/i18n";
import { buzzLight } from "@/lib/haptics";
import { useRecentJournals } from "@/hooks/useJournal";

const KEY = "nara:insights";

interface Cached {
  date: string;
  locale: string;
  text: string;
}

function readCache(): Cached | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Cached) : null;
  } catch {
    return null;
  }
}

/** Gentle AI patterns from the last 14 days. Cached per day + locale. */
export function InsightsCard() {
  const { t, fmt, locale } = useLang();
  const { data: entries = [] } = useRecentJournals();
  const [cached, setCached] = useState<Cached | null>(null);

  useEffect(() => {
    setCached(readCache());
  }, []);

  const enough = entries.length >= 3;

  const reflect = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) throw new Error("insights failed");
      return (await res.json()).insight as string | null;
    },
    onSuccess: (text) => {
      if (!text) return;
      const next = { date: new Date().toISOString(), locale, text };
      setCached(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
  });

  const shown = cached && cached.locale === locale ? cached : null;

  return (
    <section aria-labelledby="insights-h" className="sticker p-4">
      <div className="flex items-center justify-center gap-2">
        <Pip pose="default" size={44} motion="none" />
        <h2 id="insights-h" className="font-display text-[15px] font-bold text-pine">{t.insights.title}</h2>
      </div>
      <p className="mt-1 text-center font-sans text-xs text-stone-500">{t.insights.sub}</p>

      {shown && (
        <div className="mt-3 rounded-2xl bg-canvas p-3.5 dark:bg-slate-800/60">
          <p className="whitespace-pre-line font-sans text-[13.5px] leading-relaxed text-pine">{shown.text}</p>
          <p className="mt-2 text-right font-sans text-[11px] text-stone-400">
            {fmt(t.insights.updated, {
              date: new Date(shown.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            })}
          </p>
        </div>
      )}

      {reflect.isError && !shown && (
        <p role="alert" className="mt-2 text-center font-sans text-[13px] text-red-600">{t.insights.error}</p>
      )}

      {!enough && !shown ? (
        <p className="mt-2 text-center font-sans text-[13px] leading-relaxed text-stone-500">{t.insights.empty}</p>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-2">
          <button
            onClick={() => {
              buzzLight();
              reflect.mutate();
            }}
            disabled={reflect.isPending}
            className="btn-soft w-full !h-[48px] !text-sm"
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
            {reflect.isPending ? t.insights.loading : t.insights.button}
          </button>
          {shown && (
            <Link href="/chat" className="font-display text-xs font-bold text-pine underline underline-offset-2">
              {t.insights.discuss}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
