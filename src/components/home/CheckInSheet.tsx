"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartPulse, faXmark } from "@fortawesome/free-solid-svg-icons";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { useSaveJournal } from "@/hooks/useJournal";
import { moodLabel, type Mood } from "@/lib/moods";

export function CheckInSheet() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<Mood>("calm");
  const [note, setNote] = useState("");
  const save = useSaveJournal();

  const submit = () =>
    save.mutate(
      { content: note.trim() || `Feeling ${moodLabel(mood).toLowerCase()}.`, mood, duration_seconds: 0 },
      { onSuccess: () => { setOpen(false); setNote(""); } },
    );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="btn-primary w-full">
        <FontAwesomeIcon icon={faHeartPulse} className="h-4 w-4" /> Check in
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-pine/25 backdrop-blur-[2px]" />
        <Dialog.Content className="pb-safe fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 rounded-t-[28px] border border-stone-200/60 bg-white p-5 pt-6 shadow-float">
          <div className="relative text-center">
            <Dialog.Title className="h-display-sm">How are you right now?</Dialog.Title>
            <Dialog.Description className="subcopy">Pick a mood. Add a line if you want.</Dialog.Description>
            <Dialog.Close aria-label="Close" className="absolute -top-1 right-0 grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white text-stone-500 shadow-sm transition active:scale-95">
              <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
            </Dialog.Close>
          </div>
          <div className="mt-4"><MoodPicker value={mood} onChange={setMood} /></div>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} placeholder="Add a few words (optional)" className="field mt-3" />
          {save.isError && <p role="alert" className="mt-2 text-center font-sans text-[13px] text-red-600">Could not save. Please try again.</p>}
          <button onClick={submit} disabled={save.isPending} className="btn-primary mt-3 w-full">{save.isPending ? "Saving..." : "Save check in"}</button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
