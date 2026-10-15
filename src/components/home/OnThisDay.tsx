"use client";

import Link from "next/link";
import { useRecentJournals } from "@/hooks/useJournal";
import { useLang } from "@/lib/i18n";
import { MOODS } from "@/lib/moods";
import { stripHtml } from "@/lib/html";

/** Surfaces notes written on this month/day in previous years. */
export function OnThisDay() {
  const { t } = useLang();
  const { data: entries = [] } = useRecentJournals();

  const now = new Date();
  const matches = entries.filter((e) => {
    const d = new Date(e.created_at);
    return (
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate() &&
      d.getFullYear() < now.getFullYear()
    );
  }).slice(0, 2);

  if (matches.length === 0) return null;

  return (
    <section aria-labelledby="otd-h" className="sticker p-4">
      <h2 id="otd-h" className="text-center font-display text-[15px] font-bold text-pine">{t.journal.onThisDay}</h2>
      <p className="text-center font-sans text-xs text-stone-500">{t.journal.onThisDaySub}</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {matches.map((e) => {
          const Face = MOODS.find((m) => m.id === e.mood)?.Face ?? MOODS[2].Face;
          return (
            <Link key={e.id} href={`/journal/${e.id}`} prefetch className="rowcard !bg-canvas p-3.5 text-left shadow-none dark:!bg-slate-800/60">
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block font-sans text-sm font-medium leading-relaxed text-pine">
                  {stripHtml(e.content) || e.content}
                </span>
                <span className="mt-0.5 block font-sans text-[11px] tabular-nums text-stone-400">
                  {new Date(e.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </span>
              <span className="grid h-11 w-11 shrink-0 place-items-center"><Face size={44} /></span>
            </Link>
          );
        })}
      </ul>
    </section>
  );
}
