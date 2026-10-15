"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRecentJournals } from "@/hooks/useJournal";
import { useLang } from "@/lib/i18n";
import { MOODS, type Mood } from "@/lib/moods";
import { stripHtml } from "@/lib/html";
import { buzzLight } from "@/lib/haptics";

export default function JournalListPage() {
  const { t, fmt } = useLang();
  const { data: entries = [], isLoading } = useRecentJournals();
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<Mood | "all">("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const d = dateFilter ? new Date(dateFilter) : null;
    return entries.filter((e) => {
      if (mood !== "all" && e.mood !== mood) return false;
      if (d) {
        const eDate = new Date(e.created_at);
        if (eDate.getFullYear() !== d.getFullYear() || eDate.getMonth() !== d.getMonth() || eDate.getDate() !== d.getDate()) return false;
      }
      if (!q) return true;
      return stripHtml(e.content).toLowerCase().includes(q);
    });
  }, [entries, query, mood, dateFilter]);

  const handleDateChange = (date: Date) => {
    setDateFilter(date);
  };

  return (
    <main className="flex flex-col gap-4 py-1">
      <div className="sticky-top">
        <h1 className="h-display">{t.journal.allEntries}</h1>
        <p className="subcopy">{fmt(t.journal.entryCount, { n: entries.length })}</p>
      </div>

      <label className="block">
        <span className="sr-only">{t.journal.searchPh}</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.journal.searchPh}
          maxLength={100}
          className="field !rounded-full shadow-sm"
        />
      </label>

<div className="flex flex-wrap gap-2" role="group" aria-label={t.journal.moodTitle}>
        <button
          onClick={() => {
            buzzLight();
            setMood("all");
            setDateFilter(null);
            setQuery("");
          }}
          aria-pressed={mood === "all" && !dateFilter}
          className={`rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition ${!dateFilter ? "pill-active" : "pill-idle"}`}
        >
          {t.journal.filterAll}
        </button>
        {MOODS.map(({ id, Face }) => (
          <button
            key={id}
            onClick={() => {
              buzzLight();
              setMood(mood === id ? "all" : id);
              setDateFilter(null);
            }}
            aria-pressed={mood === id}
            title={t.moods[id]}
            className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 font-display text-xs font-bold transition ${
              mood === id ? "bg-pine text-[#FFF9F0] shadow-sm ring-2 ring-pine" : "border border-stone-200/70 bg-white text-stone-500"
            }`}
          >
            <Face size={28} />
            {t.moods[id]}
          </button>
        ))}
        <button
          onClick={() => setDateFilter(new Date())}
          className={`rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition ${dateFilter ? "pill-active" : "pill-idle"}`}
          aria-label="Filter by date"
        >
          {dateFilter ? `Hanya ${dateFilter.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : t.journal.searchPh}
        </button>
        <button
          onClick={() => {
            buzzLight();
            setDateFilter(null);
            setQuery("");
          }}
          className={`rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition pill-active`}
          aria-label="Lihat semua catatan"
        >
          {t.journal.seeAll}
        </button>
      </div>

      {dateFilter && (
        <p className="mt-2 font-sans text-sm text-stone-500">
          {t.journal.noResults} for {dateFilter.toLocaleDateString(undefined, { month: "short", day: "numeric" })}.
        </p>
      )}

      {isLoading ? (
        <div className="flex animate-pulse flex-col gap-2.5" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-3xl border border-stone-200/50 bg-white p-6 text-center font-sans text-sm text-stone-500 shadow-sm">
          {t.journal.noResults}
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((e) => {
            const Face = MOODS.find((m) => m.id === e.mood)?.Face ?? MOODS[2].Face;
            return (
              <Link key={e.id} href={`/journal/${e.id}`} prefetch className="rowcard p-3.5 shadow-sm">
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-left font-sans text-sm font-medium leading-relaxed text-pine">
                    {stripHtml(e.content) || e.content}
                  </span>
                  <time dateTime={e.created_at} className="mt-0.5 block font-sans text-[11px] text-stone-400">
                    {new Date(e.created_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </time>
                </span>
                <span className="grid h-11 w-11 shrink-0 place-items-center"><Face size={44} /></span>
              </Link>
            );
          })}
        </ul>
      )}
    </main>
  );
}
