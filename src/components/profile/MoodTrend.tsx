"use client";

import { useMemo } from "react";
import { MOODS, type Mood } from "@/lib/moods";
import { useRecentJournals } from "@/hooks/useJournal";
import { useLang } from "@/lib/i18n";

/** Pastel bar per mood, kept in the app's soft palette. */
const BAR: Record<Mood, string> = {
  happy: "#FCD34D",
  love: "#F9A8D4",
  calm: "#6EE7B7",
  surprised: "#C4B5FD",
  sleepy: "#CBD5E1",
};

interface Day {
  date: Date;
  count: number;
  mood: Mood | null;
}

/** 7-day mood overview: dominant Pip face per day over a soft count bar. */
export function MoodTrend() {
  const { t, locale } = useLang();
  const { data: entries = [], isLoading } = useRecentJournals();

  const days: Day[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, k) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - k));
      const next = new Date(date);
      next.setDate(date.getDate() + 1);
      const rows = entries.filter((e) => {
        const c = new Date(e.created_at);
        return c >= date && c < next;
      });
      const counts = new Map<Mood, number>();
      rows.forEach((r) => counts.set(r.mood, (counts.get(r.mood) ?? 0) + 1));
      let mood: Mood | null = null;
      let top = 0;
      counts.forEach((n, m) => {
        if (n > top) {
          top = n;
          mood = m;
        }
      });
      return { date, count: rows.length, mood };
    });
  }, [entries]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const any = days.some((d) => d.count > 0);
  const tag = locale === "id" ? "id-ID" : "en-US";

  return (
    <section aria-labelledby="moodtrend-h" className="sticker p-4">
      <h2 id="moodtrend-h" className="text-center font-display text-[15px] font-bold text-pine">
        {t.profile.moodTrend}
      </h2>
      <p className="mt-0.5 text-center font-sans text-xs text-stone-500">{t.profile.moodSub}</p>

      {isLoading ? (
        <div className="mt-3 flex h-[104px] animate-pulse items-end justify-between px-1" aria-label="Loading">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="w-6 rounded-full bg-white shadow-sm" style={{ height: 24 + ((i * 37) % 56) }} />
          ))}
        </div>
      ) : !any ? (
        <p className="mt-2 text-center font-sans text-[13px] leading-relaxed text-stone-500">{t.profile.moodEmpty}</p>
      ) : (
        <div className="mt-3 flex items-end justify-between px-1" role="img" aria-label={t.profile.moodSub}>
          {days.map(({ date, count, mood }) => {
            const Face = mood ? MOODS.find((m) => m.id === mood)?.Face : undefined;
            return (
              <div key={date.toISOString()} className="flex w-9 flex-col items-center gap-1">
                {Face ? (
                  <Face size={30} />
                ) : (
                  <span className="grid h-[30px] w-[30px] place-items-center">
                    <span className="h-2 w-2 rounded-full bg-stone-200" />
                  </span>
                )}
                <div className="flex h-14 items-end">
                  <div
                    className="w-6 rounded-full"
                    style={{
                      height: `${8 + (count / max) * 48}px`,
                      backgroundColor: mood ? BAR[mood] : "#EDE9E3",
                    }}
                  />
                </div>
                <span className="font-display text-[10px] font-bold uppercase text-stone-400">
                  {date.toLocaleDateString(tag, { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
