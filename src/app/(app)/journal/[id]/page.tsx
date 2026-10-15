"use client";

import { use } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLeaf } from "@fortawesome/free-solid-svg-icons";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { useJournalEntry, useToggleGratitude } from "@/hooks/useJournal";
import { MOODS } from "@/lib/moods";
import { useLang } from "@/lib/i18n";
import { isHtml } from "@/lib/html";
import { buzzLight } from "@/lib/haptics";

export default function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLang();
  const { data: entry, isLoading, isError } = useJournalEntry(id);
  const toggle = useToggleGratitude();

  const Face = entry ? (MOODS.find((m) => m.id === entry.mood)?.Face ?? MOODS[2].Face) : MOODS[2].Face;

  return (
    <main className="flex flex-col gap-4 py-1">
      <header className="sticky-top flex items-center justify-between">
        <Link href="/home" aria-label={t.common.back} className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white shadow-sm transition active:scale-95">
          <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5 text-stone-600" />
        </Link>
        <p className="font-display text-[15px] font-bold text-pine">{t.journal.title}</p>
        <span className="w-9" />
      </header>

      {isLoading ? (
        <div className="flex animate-pulse flex-col gap-2.5" aria-label="Loading">
          <div className="h-48 rounded-3xl bg-white shadow-sm" />
        </div>
      ) : isError || !entry ? (
        <p role="alert" className="rounded-3xl border border-stone-200/50 bg-white p-6 text-center font-sans text-sm text-stone-500 shadow-sm">
          {t.journal.notFound}
        </p>
      ) : (
        <>
          <section className="rounded-3xl border border-stone-200/50 bg-white px-4 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-sans text-[11px] tabular-nums text-stone-400">
                {Math.floor(entry.duration_seconds / 60)}:{String(entry.duration_seconds % 60).padStart(2, "0")} {t.common.min}
              </p>
              <button
                onClick={() => {
                  buzzLight();
                  toggle.mutate({ id: entry.id, value: !entry.is_gratitude });
                }}
                disabled={toggle.isPending}
                aria-pressed={entry.is_gratitude}
                title={entry.is_gratitude ? t.journal.jarSaved : t.journal.jarAdd}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[11px] font-bold transition active:scale-95 disabled:opacity-50 ${
                  entry.is_gratitude ? "bg-pine text-[#FFF9F0] shadow-sm" : "border border-stone-200/70 bg-white text-stone-500"
                }`}
              >
                <FontAwesomeIcon icon={faLeaf} className="h-3 w-3" />
                {entry.is_gratitude ? t.journal.jarSaved : t.journal.jarAdd}
              </button>
            </div>
            {isHtml(entry.content) ? (
              <div className="tiptap tiptap-readonly mt-2" dangerouslySetInnerHTML={{ __html: entry.content }} />
            ) : (
              <p className="mt-2 font-sans text-[15px] leading-relaxed text-pine">{entry.content}</p>
            )}
            <time className="mt-3 block font-sans text-[11px] text-stone-400">
              {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </time>
          </section>

          <section aria-hidden>
            <h2 className="mb-2 text-center font-display text-[13px] font-bold text-pine">{t.journal.moodTitle}</h2>
            <MoodPicker value={entry.mood} onChange={() => {}} />
          </section>

          <div className="flex items-center gap-2">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-stone-200/50 bg-canvas dark:bg-slate-800/60">
              <Face size={40} />
            </span>
            <p className="font-sans text-xs text-stone-500">{t.moods[entry.mood]}</p>
          </div>
        </>
      )}

      <Link href="/home" className="btn-primary mt-auto w-full">
        {t.common.back}
      </Link>
    </main>
  );
}
