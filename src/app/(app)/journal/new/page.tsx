"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { Pip } from "@/components/pip/Pip";
import { Dew } from "@/components/pip/PipAssets";
import { useSaveJournal } from "@/hooks/useJournal";
import type { Mood } from "@/lib/moods";

const MAX = 500;

export default function NewJournal() {
  const router = useRouter();
  const save = useSaveJournal();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("calm");
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState<null | { queued: boolean }>(null);
  const lastKey = useRef(0);

  useEffect(() => {
    const id = setInterval(() => { if (Date.now() - lastKey.current < 5000) setSeconds((s) => s + 1); }, 1000);
    return () => clearInterval(id);
  }, []);

  const submit = () =>
    save.mutate({ content: content.trim(), mood, duration_seconds: seconds }, {
      onSuccess: (r) => { setDone(r); setTimeout(() => router.push("/home"), 1600); },
    });

  return (
    <main className="flex flex-col gap-4 py-1">
      <header className="flex h-10 items-center justify-between">
        <Link href="/home" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white shadow-sm transition active:scale-95"><FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5 text-stone-600" /></Link>
        <p className="font-display text-[13px] font-bold tabular-nums text-stone-400">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</p>
        <span className="w-9" />
      </header>

      <div>
        <h1 className="h-display">What is on your mind?</h1>
        <p className="subcopy">Write it down as it is.</p>
      </div>

      <div className="relative rounded-3xl border border-stone-200/70 bg-white p-4 pt-7 shadow-sm">
        <span className="absolute -top-6 left-4 grid h-14 w-14 place-items-center">
          <Dew size={56} />
        </span>
        <div className="flex items-center justify-between">
          <span className="eyebrow">YOUR NOTE</span>
          <Link href="/home" className="rounded-full bg-stone-100 px-3 py-1 font-display text-[11px] font-bold text-stone-500">Skip</Link>
        </div>
        <label htmlFor="entry" className="sr-only">Your entry</label>
        <textarea
          id="entry" value={content} maxLength={MAX} autoFocus rows={6}
          onChange={(e) => { lastKey.current = Date.now(); setContent(e.target.value); }}
          placeholder="Start typing..."
          className="mt-2 w-full resize-none border-none bg-transparent p-0 font-sans text-[15px] leading-relaxed text-pine placeholder:font-normal placeholder:text-stone-300 focus:outline-none focus:ring-0"
        />
        <p className="text-right font-sans text-[11px] tabular-nums text-stone-400">{content.length}/{MAX}</p>
      </div>

      <div>
        <h2 id="mood-h" className="mb-2 text-center font-display text-[13px] font-bold text-pine">How does it feel?</h2>
        <MoodPicker value={mood} onChange={setMood} />
      </div>
      {save.isError && <p role="alert" className="text-center font-sans text-[13px] text-red-600">Could not save. Your words are still here, try again.</p>}

      <div className="flex flex-col items-center gap-2 pb-1 pt-1">
        <button onClick={submit} disabled={!content.trim() || save.isPending || !!done} className={content.trim() ? "btn-primary w-full" : "btn-disabled w-full"}>{save.isPending ? "Saving..." : "Save note"}</button>
        <p className="helpercopy">Short or long, both are fine.</p>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-canvas/95 px-6 text-center">
            <div>
              <Pip pose="happy" size={120} className="mx-auto" />
              <p className="h-display mt-3">{done.queued ? "Saved offline" : "Nice, saved"}</p>
              <p className="subcopy">{done.queued ? "It will sync when you are back online." : "Thanks for writing today."}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
