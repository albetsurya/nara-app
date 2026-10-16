"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { NaraIconGratitude } from "@/components/pip/PipAssets";

export interface DailyPrompt {
  id: string;
  textKey: string;
  category: "gratitude" | "reflection" | "creativity" | "mindfulness" | "growth";
}

export const DAILY_PROMPTS: DailyPrompt[] = [
  { id: "gratitude-1", textKey: "gratitude1", category: "gratitude" },
  { id: "gratitude-2", textKey: "gratitude2", category: "gratitude" },
  { id: "gratitude-3", textKey: "gratitude3", category: "gratitude" },
  { id: "reflection-1", textKey: "reflection1", category: "reflection" },
  { id: "reflection-2", textKey: "reflection2", category: "reflection" },
  { id: "reflection-3", textKey: "reflection3", category: "reflection" },
  { id: "creativity-1", textKey: "creativity1", category: "creativity" },
  { id: "creativity-2", textKey: "creativity2", category: "creativity" },
  { id: "mindfulness-1", textKey: "mindfulness1", category: "mindfulness" },
  { id: "mindfulness-2", textKey: "mindfulness2", category: "mindfulness" },
  { id: "growth-1", textKey: "growth1", category: "growth" },
  { id: "growth-2", textKey: "growth2", category: "growth" },
];

const STORAGE_KEY = "nara:dailyPrompt";

function getTodaysPromptIndex(): number {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return dayOfYear % DAILY_PROMPTS.length;
}

function getStoredPrompt(): { index: number; date: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const { index, date } = JSON.parse(stored);
    const today = new Date().toDateString();
    if (date === today) return { index, date };
    return null;
  } catch {
    return null;
  }
}

function storePrompt(index: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ index, date: new Date().toDateString() }));
  } catch {
    // ignore storage errors
  }
}

export function getTodaysPrompt(): DailyPrompt {
  const stored = getStoredPrompt();
  if (stored) return DAILY_PROMPTS[stored.index];
  const index = getTodaysPromptIndex();
  storePrompt(index);
  return DAILY_PROMPTS[index];
}

export function DailyPromptBanner() {
  const { t } = useLang();
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dailyPrompt = getTodaysPrompt();
    setPrompt(dailyPrompt);
    // Show prompt 30% of the time to avoid annoyance
    setShow(Math.random() < 0.3);
  }, [t]);

  const dismiss = () => setShow(false);

  if (!prompt || !show) return null;

  // Type-safe access to prompts translations
  const getPromptText = (key: string) => t.prompts?.[key as keyof typeof t.prompts] ?? key;
  const getDailyTitle = () => t.prompts?.dailyTitle ?? "A gentle prompt";

  return (
    <div
      role="status"
      className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40"
      onClick={() => setShow(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="w-full rounded-2xl border border-amber-200/60 bg-[#FFFDF5] px-4 py-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100/70 p-1">
            <NaraIconGratitude size={34} />
          </span>
          <div className="flex-1">
            <p className="font-display text-[13px] font-bold text-amber-900">
              {getDailyTitle()}
            </p>
            <p className="mt-1 font-sans text-[14px] leading-relaxed text-amber-800">
              {getPromptText(prompt.textKey)}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            className="shrink-0 rounded-full p-1 text-amber-500 hover:bg-amber-100"
            aria-label="Dismiss"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}