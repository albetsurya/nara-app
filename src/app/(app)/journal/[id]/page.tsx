"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { Pip } from "@/components/pip/Pip";
import { MOODS } from "@/lib/moods";
import { useLang } from "@/lib/i18n";

interface JournalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { id } = await params;
  const { t } = useLang();

  // For now, mock data - in real app, fetch from Supabase
  const entry = {
    id,
    content: "Tulis catatan detail di sini...",
    mood: "calm" as const,
    created_at: new Date().toISOString(),
    duration_seconds: 120,
  };

  const Face = MOODS.find((m) => m.id === entry.mood)?.Face ?? MOODS[2].Face;

  return (
    <main className="flex flex-col gap-4 py-1">
      <header className="sticky-top flex items-center justify-between">
        <Link href="/home" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white shadow-sm transition active:scale-95"><FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5 text-stone-600" /></Link>
        <p className="font-display text-[15px] font-bold text-pine">{t.journal.title}</p>
        <span className="w-9" />
      </header>

      <section className="rounded-3xl border border-stone-200/50 bg-white px-4 py-5 shadow-sm">
        <p className="text-right font-sans text-[11px] tabular-nums text-stone-400">
          {Math.floor(entry.duration_seconds / 60)}:{String(entry.duration_seconds % 60).padStart(2, "0")} {t.common.min}
        </p>
        <p className="mt-2 font-sans text-[15px] leading-relaxed text-pine">{entry.content}</p>
        <time className="mt-3 block font-sans text-[11px] text-stone-400">
          {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </time>
      </section>

      <section>
        <h2 className="mb-2 text-center font-display text-[13px] font-bold text-pine">{t.journal.moodTitle}</h2>
        <MoodPicker value={entry.mood} onChange={() => {}} />
      </section>

      <Link href="/home" className="btn-primary w-full mt-auto mb-4">
        {t.common.back}
      </Link>
    </main>
  );
}