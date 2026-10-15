"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faBell } from "@fortawesome/free-solid-svg-icons";
import {
  Moss,
  Dew,
  Sandy,
  Shelly,
  Paperclip,
} from "@/components/pip/PipAssets";

const INTENTS = [
  { id: "clearer-head", title: "A clearer head", Char: Dew, tint: "bg-[#E3F1FA]" },
  { id: "everyday-habits", title: "Everyday habits", Char: Moss, tint: "bg-[#E4F2E6]" },
  { id: "new-idea", title: "A new idea", Char: Sandy, tint: "bg-[#FCEEDF]" },
  { id: "next-chapter", title: "My next chapter", Char: Shelly, tint: "bg-[#ECE7F8]" },
];

const COMPANIONS = [
  {
    name: "Sandy",
    tag: "PLAYFUL",
    quote: "Brain full of tabs? Let's close a few, one tiny thought at a time.",
    vibe: "Light and playful, keeps things easy.",
    bg: "bg-[#FBE9E0]",
    Char: Sandy,
  },
  {
    name: "Dew",
    tag: "GENTLE",
    quote: "Take your time. Every feeling has a place here.",
    vibe: "Warm and quiet, listens first.",
    bg: "bg-[#EAF3EB]",
    Char: Dew,
  },
  {
    name: "Moss",
    tag: "STEADY",
    quote: "One day, one step, one quiet breath.",
    vibe: "Calm and steady, grounds you.",
    bg: "bg-[#E6EFF8]",
    Char: Moss,
  },
];

const slideAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.22, ease: "easeOut" },
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [selectedIntents, setSelectedIntents] = useState<string[]>(["clearer-head"]);
  const [companionIdx, setCompanionIdx] = useState(0);
  const [dailyMinutes, setDailyMinutes] = useState(5);
  const [reminderActive, setReminderActive] = useState(true);
  const [firstThought, setFirstThought] = useState("");

  const toggleIntent = (id: string) => {
    setSelectedIntents((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((item) => item !== id)
          : prev
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const handleFinish = () => {
    localStorage.setItem(
      "nara:onboarding",
      JSON.stringify({
        intents: selectedIntents,
        companion: COMPANIONS[companionIdx].name,
        dailyMinutes,
        firstThought,
      })
    );
    router.push("/login");
  };

  return (
    <main className="pt-safe pb-safe mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-y-auto bg-canvas px-5 text-pine select-none">
      <div className="flex h-12 shrink-0 items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white shadow-sm transition active:scale-95"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5 text-stone-600" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        {step > 0 && (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-pine" : "w-1.5 bg-stone-300"
                }`}
              />
            ))}
          </div>
        )}

        <div className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-0" {...slideAnim} className="flex flex-1 flex-col py-2">
            <p className="shrink-0 text-center font-display text-xl font-bold text-pine">nara</p>

            <div className="grid flex-1 place-items-center">
              <div className="w-full">
                <div className="mx-auto grid w-full max-w-[300px] grid-cols-2 gap-3 pt-5">
                  <div className="relative -rotate-6 rounded-2xl border border-amber-200/40 bg-[#FFF6D4] p-3.5 shadow-md">
                    <div className="mx-auto mb-1.5 h-2.5 w-2.5 rounded-full bg-red-400" />
                    <p className="text-center font-display text-[13px] font-bold leading-snug text-amber-950">More walks.</p>
                    <p className="text-center font-display text-[13px] font-medium text-amber-900/80">Less scrolling.</p>
                  </div>

                  <div className="relative rotate-6 rounded-2xl border border-stone-200/60 bg-white p-3.5 pt-5 shadow-md">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Paperclip size={26} />
                    </span>
                    <p className="text-center font-display text-[13px] font-bold leading-snug text-stone-700">Sent that</p>
                    <p className="text-center font-display text-[13px] font-medium text-stone-500">message.</p>
                  </div>

                  <div className="relative -rotate-3 rounded-2xl border border-indigo-100 bg-[#EBE7F7] p-3.5 pt-5 shadow-md">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Paperclip size={26} />
                    </span>
                    <p className="text-center font-display text-[13px] font-semibold leading-snug text-indigo-950">something for fun.</p>
                  </div>

                  <div className="relative rotate-3 rounded-2xl border border-orange-100 bg-[#FFE4DC] p-3.5 shadow-md">
                    <p className="text-center font-display text-[13px] font-semibold leading-snug text-orange-950">slow days count, too</p>
                  </div>
                </div>

                <div className="flex justify-center py-1.5 text-pine">
                  <svg width="40" height="40" viewBox="0 0 42 42" fill="none" aria-hidden>
                    <path d="M14 6 C28 6 36 24 20 28 C12 30 8 18 20 18 C30 18 34 32 30 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M26 38 L31 39 L33 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="px-2 text-center">
                  <h1 className="h-display">Your thoughts, ideas, and stories.</h1>
                  <p className="subcopy">All welcome here.</p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 pb-1 pt-3">
              <button onClick={() => setStep(1)} className="btn-primary w-full">
                Get started
              </button>
              <p className="helpercopy">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-pine underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-1" {...slideAnim} className="flex min-h-0 flex-1 flex-col py-1">
            <div className="shrink-0">
              <h1 className="h-display">What is on your mind?</h1>
              <p className="subcopy">Pick what feels closest today.</p>

              <div className="mt-4 flex flex-col gap-2.5">
                {INTENTS.map(({ id, title, Char, tint }) => {
                  const active = selectedIntents.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleIntent(id)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 rounded-[22px] border py-2 pl-5 pr-2 transition ${
                        active
                          ? "border-pine bg-white shadow-sm ring-2 ring-pine"
                          : "border-stone-200/70 bg-white hover:border-stone-300"
                      }`}
                    >
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block font-display text-[16px] font-bold leading-snug text-pine">
                          {title}
                        </span>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 font-display text-[10.5px] font-bold tracking-wide ${active ? "bg-pine text-[#FFF9F0]" : "bg-stone-100 text-stone-500"}`}>
                          {active ? "Selected" : "Tap to pick"}
                        </span>
                      </span>
                      <span className={`grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-2xl ${tint}`}>
                        <Char size={68} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 pb-1 pt-3">
              <button onClick={() => setStep(2)} className="btn-primary w-full">
                Continue
              </button>
              <p className="helpercopy">Pick up to three. You can change this later.</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" {...slideAnim} className="flex min-h-0 flex-1 flex-col py-1">
            <div className="grid min-h-0 flex-1 place-items-center">
              <div className="w-full">
                <h1 className="h-display">Who matches your vibe?</h1>
                <p className="subcopy">This buddy will sit with you while you write.</p>

                {(() => {
                  const comp = COMPANIONS[companionIdx];
                  const Char = comp.Char;
                  return (
                    <div className="mt-3 flex flex-col items-center">
                      <div
                        className={`flex w-full flex-col items-center px-5 pb-5 pt-4 text-center shadow-sm rounded-3xl border border-stone-200/50 ${comp.bg}`}
                      >
                        <span className="rounded-full border border-stone-700/30 px-3 py-1 font-display text-[10px] font-bold tracking-[0.14em] text-stone-700">
                          {comp.tag}
                        </span>

                        <span className="grid h-[148px] w-[160px] place-items-center overflow-hidden">
                          <Char size={132} />
                        </span>

                        <p className="max-w-[240px] font-display text-sm font-bold leading-relaxed text-stone-700">
                          {comp.quote}
                        </p>
                      </div>

                      <div className="mt-2.5 text-center">
                        <p className="font-display text-lg font-bold text-pine">{comp.name}</p>
                        <p className="font-sans text-xs text-stone-500">{comp.vibe}</p>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        {COMPANIONS.map((_, idx) => (
                          <button
                            key={idx}
                            aria-label={`Choose ${COMPANIONS[idx].name}`}
                            onClick={() => setCompanionIdx(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              idx === companionIdx ? "w-5 bg-pine" : "w-1.5 bg-stone-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 pb-1 pt-2">
              <button onClick={() => setStep(3)} className="btn-primary w-full">
                That is my companion
              </button>
              <p className="helpercopy">You can switch buddies anytime.</p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step-3" {...slideAnim} className="flex min-h-0 flex-1 flex-col py-1">
            <div className="grid min-h-0 flex-1 place-items-center">
              <div className="w-full">
                <div className="text-center">
                  <h1 className="h-display">Small time, big feelings</h1>
                  <p className="subcopy">A few minutes to check in with yourself.</p>
                </div>

                <div className="mt-3 flex flex-col items-center">
                  <div className="relative grid h-52 w-52 place-items-center">
                    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="7" fill="none" strokeDasharray="2 3" />
                      <circle
                        cx="50" cy="50" r="40" stroke="#7FB6D9" strokeWidth="7" strokeLinecap="round" fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * (dailyMinutes / 15))}
                      />
                    </svg>

                    <div className="flex flex-col items-center text-center">
                      <span className="font-display text-5xl font-bold leading-none tabular-nums text-pine">
                        {dailyMinutes}
                      </span>
                      <span className="mt-1 font-display text-[11px] font-bold tracking-[0.14em] text-stone-500">
                        MIN / DAY
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {[3, 5, 10].map((m) => (
                      <button
                        key={m}
                        onClick={() => setDailyMinutes(m)}
                        aria-pressed={dailyMinutes === m}
                        className={`rounded-full px-4 py-1.5 font-display text-xs font-bold transition ${
                          dailyMinutes === m ? "pill-active" : "pill-idle"
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pine-soft text-pine">
                        <FontAwesomeIcon icon={faBell} className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        <span className="block font-display text-[13.5px] font-bold text-pine">A little nudge?</span>
                        <span className="block font-sans text-xs text-stone-500">8:30 PM, your call</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setReminderActive(!reminderActive)}
                      aria-pressed={reminderActive}
                      aria-label="Toggle reminder"
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        reminderActive ? "bg-pine" : "bg-stone-300"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          reminderActive ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 pb-1 pt-2">
              <button onClick={() => setStep(4)} className="btn-primary w-full">
                Set my daily rhythm
              </button>
              <button onClick={() => setStep(4)} className="py-1 font-sans text-xs font-medium text-stone-500">
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step-4" {...slideAnim} className="flex min-h-0 flex-1 flex-col py-1">
            <div>
              <div className="text-center">
                <h1 className="h-display">Let us start with you</h1>
                <p className="subcopy">There is no right place to start.</p>
              </div>

              <div className="relative mt-8 rounded-3xl border border-stone-200/70 bg-white p-5 pt-6 shadow-sm">
                <span className="absolute -top-7 left-5 grid h-14 w-14 place-items-center">
                  <Dew size={56} />
                </span>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(5)}
                    className="rounded-full bg-stone-100 px-3 py-1 font-display text-[11px] font-bold text-stone-500 hover:bg-stone-200"
                  >
                    Skip
                  </button>
                </div>

                <div className="mt-2">
                  <h3 className="font-display text-[15px] font-bold text-pine">
                    What is on your mind?
                  </h3>
                  <p className="mt-0.5 font-sans text-xs leading-relaxed text-stone-500">
                    An idea, a feeling, or how today went.
                  </p>

                  <div className="mt-3">
                    <span className="eyebrow">YOUR THOUGHT</span>
                    <textarea
                      rows={4}
                      value={firstThought}
                      onChange={(e) => setFirstThought(e.target.value.slice(0, 500))}
                      placeholder="Write a thought..."
                      className="mt-1 w-full resize-none border-none bg-transparent p-0 font-sans text-[15px] leading-relaxed text-pine placeholder:font-normal placeholder:text-stone-300 focus:outline-none focus:ring-0"
                    />
                    <div className="text-right font-sans text-[11px] tabular-nums text-stone-400">
                      {firstThought.length}/500
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col items-center gap-2 pb-1 pt-2">
              <button
                onClick={() => setStep(5)}
                disabled={firstThought.trim().length === 0}
                className={firstThought.trim().length > 0 ? "btn-primary w-full" : "btn-disabled w-full"}
              >
                Save my thought
              </button>
              <p className="helpercopy">Write as much or as little as you want.</p>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step-5" {...slideAnim} className="flex min-h-0 flex-1 flex-col py-1">
            <div>
              <div className="text-center">
                <h1 className="h-display">A good start</h1>
                <p className="subcopy">You turned a thought into a first step.</p>
              </div>

              <div className="mt-5 flex flex-col items-center">
                <div className="flex h-52 w-40 flex-col items-center justify-between rounded-xl border-4 border-dashed border-white bg-[#D98A78] p-3 text-white shadow-md">
                  <div className="font-display text-[10px] font-bold tracking-[0.14em] opacity-90">
                    NARA / FIRST EDITION
                  </div>

                  <svg width={64} height={64} viewBox="0 0 72 72" fill="none" aria-hidden>
                    <path
                      d="M36 14 C46 14 54 22 54 32 C54 44 36 56 36 56 C36 56 18 44 18 32 C18 22 26 14 36 14 Z"
                      stroke="#FFF6E0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                    />
                    <path d="M36 24 C40 24 44 28 44 32 C44 38 36 44 36 44 C36 44 28 38 28 32 C28 28 32 24 36 24 Z" fill="#FFF6E0" />
                  </svg>

                  <div className="flex w-full justify-between font-display text-[10px] font-bold tracking-wider">
                    <span>FIRST WORD</span>
                    <span>001</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="font-display text-[17px] font-bold text-pine">Your first stamp</p>
                  <p className="mx-auto mt-1 max-w-[240px] font-sans text-xs leading-relaxed text-stone-500">
                    Small moments are worth keeping. Your collection grows as you do.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col items-center gap-2 pb-1 pt-2">
              <button onClick={handleFinish} className="btn-primary w-full">
                Open my space
              </button>
              <p className="helpercopy">Small steps count.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
