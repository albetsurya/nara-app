"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Pip } from "@/components/pip/Pip";
import { NoteMint } from "@/components/pip/PipAssets";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CheckInSheet } from "./CheckInSheet";
import { useProfile, useRecentJournals } from "@/hooks/useJournal";
import { createClient } from "@/lib/supabase/client";
import { DAILY_GOAL_SECONDS, keys, secondsWrittenToday } from "@/lib/queries";
import { MOODS } from "@/lib/moods";
import { useSignOut } from "@/hooks/useSignOut";

const StampsPreview = dynamic(() => import("./StampsPreview"), {
  ssr: false,
});

export function HomeView() {
  const qc = useQueryClient();
  const signOut = useSignOut();
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
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="flex flex-col gap-4 pt-1">
      <header className="flex h-10 items-center justify-between">
        <p className="font-display text-xl font-bold text-pine">nara</p>
        <button onClick={signOut} className="rounded-full border border-stone-200/70 bg-white px-3 py-1.5 font-display text-xs font-bold text-stone-500 shadow-sm">Sign out</button>
      </header>

      <div>
        <h1 className="h-display">Small time, big feelings</h1>
        <p className="subcopy">{hello}{profile?.username ? `, ${profile.username}` : ""}. A few minutes is enough.</p>
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
            <span className="mt-1 font-display text-[10px] font-bold tracking-[0.14em] text-stone-500">MIN TODAY</span>
          </div>
        </div>

        <p className="mt-2 rounded-full bg-pine-soft px-3 py-1 font-display text-xs font-bold text-pine">
          Goal {goalMins} min
        </p>
        <p className="mt-2 text-center font-sans text-[13px] leading-relaxed text-stone-500">
          {done ? "You showed up today. Nicely done." : secs === 0 ? "Start with one short note." : "Nice pace. Keep going gently."}
        </p>
        <div className="mt-3 w-full"><CheckInSheet /></div>
      </section>

      <section aria-labelledby="recent-h">
        <h2 id="recent-h" className="mb-2 text-center font-display text-[15px] font-bold text-pine">Recent thoughts</h2>
        {entries.length === 0 ? (
          <Link href="/journal/new" className="rowcard p-3.5 text-left shadow-sm">
            <span className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center"><NoteMint size={44} /></span>
              <span><span className="block font-display text-[15px] font-bold text-pine">Nothing here yet</span><span className="block font-sans text-[13px] text-stone-500">Tap to write your first note.</span></span>
            </span>
          </Link>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {entries.slice(0, 3).map((e, idx) => {
              const Face = MOODS.find((m) => m.id === e.mood)?.Face ?? MOODS[2].Face;
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="rowcard p-3.5 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
                >
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-left font-sans text-sm font-medium leading-relaxed text-pine">{e.content}</span>
                    <time dateTime={e.created_at} className="mt-0.5 block font-sans text-[11px] text-stone-400">{new Date(e.created_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</time>
                  </span>
                  <span className="grid h-11 w-11 shrink-0 place-items-center"><Face size={44} /></span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </section>

      <StampsPreview />
    </main>
  );
}
