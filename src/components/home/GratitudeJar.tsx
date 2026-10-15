"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf, faShuffle } from "@fortawesome/free-solid-svg-icons";
import { useRecentJournals } from "@/hooks/useJournal";
import { useLang } from "@/lib/i18n";
import { stripHtml } from "@/lib/html";
import { buzzLight } from "@/lib/haptics";

/** A jar of kept sweet moments. Opens one at random. */
export function GratitudeJar() {
  const { t, fmt } = useLang();
  const { data: entries = [] } = useRecentJournals();
  const [seed, setSeed] = useState(0);

  const kept = useMemo(() => entries.filter((e) => e.is_gratitude), [entries]);
  const pick = kept.length > 0 ? kept[seed % kept.length] : null;

  if (kept.length === 0) {
    return (
      <section aria-labelledby="jar-h" className="sticker p-4 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pine-soft text-pine">
          <FontAwesomeIcon icon={faLeaf} className="h-5 w-5" />
        </span>
        <h2 id="jar-h" className="mt-2 font-display text-[15px] font-bold text-pine">{t.jar.title}</h2>
        <p className="mt-1 font-sans text-[13px] leading-relaxed text-stone-500">{t.jar.empty}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="jar-h" className="sticker p-4">
      <div className="flex items-center justify-center gap-2">
        <FontAwesomeIcon icon={faLeaf} className="h-4 w-4 text-pine" />
        <h2 id="jar-h" className="font-display text-[15px] font-bold text-pine">{t.jar.title}</h2>
      </div>
      <p className="mt-0.5 text-center font-sans text-xs text-stone-500">
        {t.jar.sub} · {fmt(t.jar.count, { n: kept.length })}
      </p>

      {pick && (
        <Link key={pick.id} href={`/journal/${pick.id}`} prefetch className="rowcard mt-3 !bg-canvas p-3.5 text-left shadow-none dark:!bg-slate-800/60">
          <span className="line-clamp-3 block min-w-0 flex-1 font-sans text-sm font-medium leading-relaxed text-pine">
            {stripHtml(pick.content) || pick.content}
          </span>
        </Link>
      )}

      <button
        onClick={() => {
          buzzLight();
          setSeed((s) => s + 1 + Math.floor(Math.random() * Math.max(kept.length - 1, 1)));
        }}
        className="btn-soft mt-3 w-full !h-[48px] !text-sm"
      >
        <FontAwesomeIcon icon={faShuffle} className="h-4 w-4" />
        {t.jar.open}
      </button>
    </section>
  );
}
