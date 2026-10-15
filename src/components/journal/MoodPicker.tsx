"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { motion } from "framer-motion";
import { MOODS, type Mood } from "@/lib/moods";

export function MoodPicker({ value, onChange }: { value: Mood; onChange: (m: Mood) => void }) {
  return (
    <RadioGroup.Root value={value} onValueChange={(v) => onChange(v as Mood)} aria-label="How are you feeling?" className="grid grid-cols-5 gap-2">
      {MOODS.map(({ id, label, Face }) => {
        const on = value === id;
        return (
          <RadioGroup.Item
            key={id}
            value={id}
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className={`flex flex-col items-center gap-1 rounded-2xl border bg-white px-1 pb-2 pt-2 transition-all ${
                on ? "border-pine shadow-md ring-2 ring-pine -translate-y-0.5" : "border-stone-200/70 hover:border-stone-300"
              }`}
            >
              <motion.span
                animate={{
                  scale: on ? [1, 1.2, 1.1] : 1,
                  rotate: on ? [0, -6, 6, 0] : 0,
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="grid h-[52px] w-[52px] place-items-center"
              >
                <Face size={48} />
              </motion.span>
              <span className={`font-display text-[11px] leading-none ${on ? "font-bold text-pine" : "font-semibold text-stone-400"}`}>
                {label}
              </span>
            </motion.button>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
