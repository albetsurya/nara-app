"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faBullseye } from "@fortawesome/free-solid-svg-icons";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { Pip } from "@/components/pip/Pip";
import { Dew } from "@/components/pip/PipAssets";
import { useSaveJournal, useRecentJournals } from "@/hooks/useJournal";
import type { Mood } from "@/lib/moods";
import { DAILY_GOAL_SECONDS, secondsWrittenToday } from "@/lib/queries";
import { useLang } from "@/lib/i18n";
import { buzzSuccess } from "@/lib/haptics";
import { TemplateSelector } from "@/components/journal/TemplateSelector";
import { DailyPromptBanner } from "@/components/journal/DailyPrompt";
import { RichEditor, ENTRY_MAX } from "@/components/journal/RichEditor";
import { getTemplate, ENTRY_TEMPLATES } from "@/lib/templates";
import { textToHtml } from "@/lib/html";

const MAX = ENTRY_MAX;

export default function NewJournal() {
  const router = useRouter();
  const { t, fmt, locale } = useLang();
  const save = useSaveJournal();
  const { data: entries = [] } = useRecentJournals();
  const [content, setContent] = useState("");
  const [plain, setPlain] = useState("");
  const [mood, setMood] = useState<Mood>("calm");
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState<null | { queued: boolean }>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("free");
  const lastKey = useRef(0);

  // Session time + today's written time feed one shared goal progress.
  const already = secondsWrittenToday(entries);
  const total = already + seconds;
  const reached = total >= DAILY_GOAL_SECONDS;
  const goalMins = DAILY_GOAL_SECONDS / 60;
  const reachedRef = useRef(reached);
  useEffect(() => {
    if (reached && !reachedRef.current) buzzSuccess();
    reachedRef.current = reached;
  }, [reached]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    if (template.id !== "free" && !plain) {
      setContent(textToHtml(template.structure));
    } else if (template.id === "free" && !plain) {
      setContent("");
    }
  };

  const handleEditorChange = (html: string, text: string) => {
    setContent(html);
    setPlain(text);
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastKey.current < 5000) setSeconds((s) => s + 1);
      setTick((x) => x + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const idle = seconds > 0 && Date.now() - lastKey.current >= 5000;

  // Pip reacts to the writing rhythm: sleeps when paused, cheers at the goal.
  let coach = t.journal.msgStart;
  let coachSub: string | null = seconds === 0 ? t.journal.timerHint : null;
  let pipPose: "default" | "sleepy" | "happy" = "default";
  if (reached) {
    coach = t.journal.msgDone;
    coachSub = null;
    pipPose = "happy";
  } else if (idle) {
    coach = t.journal.msgPaused;
    coachSub = null;
    pipPose = "sleepy";
  } else if (seconds >= 180) {
    coach = t.journal.msgAlmost;
  } else if (seconds >= 60) {
    coach = t.journal.msgGoing;
  }

  const submit = () =>
    save.mutate({ content: content.trim(), mood, duration_seconds: seconds }, {
      onSuccess: (r) => { buzzSuccess(); setDone(r); setTimeout(() => router.push("/home"), 1600); },
    });

  const canSave = plain.trim().length > 0 && plain.length <= MAX && !save.isPending && !done;

  return (
    <main className="flex flex-col gap-4 py-1">
      <header className="sticky-top flex items-center justify-between">
        <Link href="/home" aria-label={t.common.back} className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white shadow-sm transition active:scale-95"><FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5 text-stone-600" /></Link>
        <div className="flex flex-col items-center gap-1">
          <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[12px] font-bold tabular-nums shadow-sm transition-colors ${reached ? "bg-mint text-pine" : "bg-pine-soft text-pine"}`}>
            <FontAwesomeIcon icon={faBullseye} className="h-3 w-3" />
            {fmt(t.journal.timerGoalToday, { a: Math.floor(Math.min(total, DAILY_GOAL_SECONDS) / 60), b: goalMins })}
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-200/70" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(total / DAILY_GOAL_SECONDS, 1) * 100)}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${reached ? "bg-mint" : "bg-pine"}`}
              style={{ width: `${Math.min(total / DAILY_GOAL_SECONDS, 1) * 100}%` }}
            />
          </div>
        </div>
        <span className="w-9" />
      </header>

      <div className="flex items-center gap-2.5 rounded-2xl border border-stone-200/70 bg-white px-3 py-2 shadow-sm" aria-live="polite">
        <Pip pose={pipPose} size={40} motion={reached ? "breathe" : "none"} />
        <div className="min-w-0">
          <p className="font-sans text-[13px] font-medium leading-snug text-pine">{coach}</p>
          {coachSub && <p className="font-sans text-[11px] leading-snug text-stone-400">{coachSub}</p>}
        </div>
      </div>

      <DailyPromptBanner />

      <div>
        <h1 className="h-display">{t.journal.title}</h1>
        <p className="subcopy">{t.journal.sub}</p>
      </div>

      <div className="relative rounded-3xl border border-stone-200/70 bg-white p-4 pt-7 shadow-sm">
        <span className="absolute -top-6 left-4 grid h-14 w-14 place-items-center">
          <Dew size={56} />
        </span>
        <div className="flex items-center justify-between">
          <span className="eyebrow">{t.journal.yourNote}</span>
          <Link href="/home" className="rounded-full bg-stone-100 px-3 py-1 font-display text-[11px] font-bold text-stone-500">{t.common.skip}</Link>
        </div>

        <TemplateSelector
          initialTemplate={selectedTemplate}
          onSelect={handleTemplateSelect}
        />

        <label htmlFor="entry" className="sr-only">{t.journal.yourNote}</label>
        <RichEditor
          key={locale}
          content={content}
          placeholder={t.journal.placeholder}
          autoFocus
          onChange={handleEditorChange}
          onType={() => {
            lastKey.current = Date.now();
          }}
        />
        <div className="flex items-center justify-between">
          <p className={`font-sans text-[11px] ${plain.length > MAX ? "font-semibold text-red-500" : "invisible"}`}>
            {t.journal.overLimit}
          </p>
          <p className={`text-right font-sans text-[11px] tabular-nums ${plain.length > MAX ? "font-semibold text-red-500" : "text-stone-400"}`}>{plain.length}/{MAX}</p>
        </div>
      </div>

      <div>
        <h2 id="mood-h" className="mb-2 text-center font-display text-[13px] font-bold text-pine">{t.journal.moodTitle}</h2>
        <MoodPicker value={mood} onChange={setMood} />
      </div>
      {save.isError && <p role="alert" className="text-center font-sans text-[13px] text-red-600">{t.journal.error}</p>}

      <div className="flex flex-col items-center gap-2 pb-1 pt-1">
        <button onClick={submit} disabled={!canSave} className={canSave ? "btn-primary w-full" : "btn-disabled w-full"}>{save.isPending ? t.common.saving : t.journal.save}</button>
        <p className="helpercopy">{t.journal.hint}</p>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-canvas/95 px-6 text-center dark:bg-[#141A26]/95">
            <div>
              <Pip pose="happy" size={120} className="mx-auto" />
              <p className="h-display mt-3">{done.queued ? t.journal.savedOffline : t.journal.saved}</p>
              <p className="subcopy">{done.queued ? t.journal.savedOfflineSub : t.journal.savedSub}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
