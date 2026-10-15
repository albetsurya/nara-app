"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Pip } from "@/components/pip/Pip";
import { NoteMint } from "@/components/pip/PipAssets";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CheckInSheet } from "./CheckInSheet";
import { OnThisDay } from "./OnThisDay";
import { useProfile, useRecentJournals } from "@/hooks/useJournal";
import { createClient } from "@/lib/supabase/client";
import { DAILY_GOAL_SECONDS, keys, secondsWrittenToday } from "@/lib/queries";
import { MOODS } from "@/lib/moods";
import { stripHtml } from "@/lib/html";
import { useSignOut } from "@/hooks/useSignOut";
import { useLang } from "@/lib/i18n";
import { buzzLight } from "@/lib/haptics";

const StampsPreview = dynamic(() => import("./StampsPreview"), {
  ssr: false,
});

export function HomeView() {
  const qc = useQueryClient();
  const signOut = useSignOut();
  const { t, fmt } = useLang();
  const { data: profile } = useProfile();
  const { data: entries = [] } = useRecentJournals();

  useEffect(() => {
    if (!profile) return;
    const raw = localStorage.getItem("nara:onboarding");
    if (!raw) return;
    try {
      const { intent, companion } = JSON.parse(raw);
      createClient().from("profiles").update({ intent, companion_name: companion }).eq("id", profile.id)
        .then(({ error }) => { if (!error) { localStorage.removeItem("nara:onboarding"); qc.invalidateQueries({ queryKey: keys.profile }); } });
    } catch { localStorage.removeItem("nara:onboarding"); }
  }, [profile, qc]);

  const secs = secondsWrittenToday(entries);
  const mins = Math.floor(secs / 60);
  const goalMins = DAILY_GOAL_SECONDS / 60;
  const done = secs >= DAILY_GOAL_SECONDS;
  const hour = new Date().getHours();
  const daypart = hour < 12 ? t.time.morning : hour < 18 ? t.time.afternoon : t.time.evening;
  const nameSuffix = profile?.username ? `, ${profile.username}` : "";

  const last = entries[0]?.created_at ? new Date(entries[0].created_at) : null;
  const today = new Date();
  const isToday = last
    ? last.getFullYear() === today.getFullYear() && last.getMonth() === today.getMonth() && last.getDate() === today.getDate()
    : false;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = last
    ? last.getFullYear() === yesterday.getFullYear() && last.getMonth() === yesterday.getMonth() && last.getDate() === yesterday.getDate()
    : false;
  const hello = entries.length === 0
    ? fmt(t.home.fresh, { name: nameSuffix })
    : isToday || done
      ? fmt(t.home.today, { name: nameSuffix })
      : isYesterday
        ? fmt(t.home.yesterday, { name: nameSuffix })
        : fmt(t.home.away, { name: nameSuffix });

  return (
    <main className="flex flex-col gap-4 pt-1">
      <header className="sticky-top flex items-center justify-between">
        <p className="font-display text-xl font-bold text-pine">nara</p>
        <Link href="/profile" aria-label={t.nav.profile} className="rounded-full border border-stone-200/70 bg-white p-2 shadow-sm transition active:scale-95">
          <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-stone-600" />
        </Link>
      </header>

      <div>
        <h1 className="h-display">{t.home.title}</h1>
        <p className="subcopy">{daypart}. {hello}</p>
      </div>

      <section aria-label="Today" className="flex flex-col items-center rounded-3xl border border-stone-200/50 bg-white px-4 py-5 shadow-sm">
        <div className="relative grid h-44 w-44 place-items-center">
          <div className="absolute inset-0">
            <ProgressRing value={secs / DAILY_GOAL_SECONDS} size={176} stroke={18}>
              <span />
            </ProgressRing>
          </div>
          <div className="flex flex-col items-center text-center">
            <Pip pose={done ? "happy" : "default"} size={48} motion="breathe" companion={(profile?.companion_name as never) ?? "Pip"} />
            <span className="mt-0.5 font-display text-[40px] font-bold leading-none tabular-nums text-pine">{mins}</span>
            <span className="mt-1 font-display text-[10px] font-bold tracking-[0.14em] text-stone-500">{t.home.minToday}</span>
          </div>
        </div>

        <p className="mt-2 rounded-full bg-pine-soft px-3 py-1 font-display text-xs font-bold text-pine">
          {fmt(t.home.goal, { n: goalMins })}
        </p>
        <p className="mt-2 text-center font-sans text-[13px] leading-relaxed text-stone-500">
          {done ? t.home.done : secs === 0 ? t.home.idle : t.home.going}
        </p>
        <div className="mt-3 w-full"><CheckInSheet /></div>
      </section>

      <section aria-labelledby="recent-h">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 id="recent-h" className="font-display text-[15px] font-bold text-pine">{t.home.recent}</h2>
          {entries.length > 0 && (
            <Link href="/journal" prefetch className="font-display text-xs font-bold text-pine underline underline-offset-2">
              {t.home.seeAll}
            </Link>
          )}
        </div>
        {entries.length === 0 ? (
          <Link href="/journal/new" className="rowcard p-3.5 text-left shadow-sm">
            <div className="flex flex-col gap-2 pt-2">
              <Pip pose="default" size={32} motion="breathe" />
              <span className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center"><span className="svg-asset-wrapper" data-asset="note"><NoteMint size={44} /></span></span>
                <span><span className="block font-display text-[15px] font-bold text-pine">{t.home.emptyTitle}</span><span className="block font-sans text-[13px] text-stone-500">{t.home.emptySub}</span></span>
              </span>
            </div>
          </Link>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {entries.slice(0, 3).map((e) => {
              const Face = MOODS.find((m) => m.id === e.mood)?.Face ?? MOODS[2].Face;
              return (
                <Link key={e.id} href={`/journal/${e.id}`} prefetch className="rowcard p-3.5 shadow-sm">
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-left font-sans text-sm font-medium leading-relaxed text-pine">{stripHtml(e.content) || e.content}</span>
                    <time dateTime={e.created_at} className="mt-0.5 block font-sans text-[11px] text-stone-400">{new Date(e.created_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</time>
                  </span>
                  <span className="grid h-11 w-11 shrink-0 place-items-center"><Face size={44} /></span>
                </Link>
              );
            })}
          </ul>
        )}
      </section>

      <OnThisDay />

      <StampsPreview />
    </main>
  );
}
