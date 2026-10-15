"use client";

import { useLang, type Locale } from "@/lib/i18n";
import { buzzLight } from "@/lib/haptics";

/** Compact ID / EN segmented switch. */
export function LocaleSwitch({ large = false }: { large?: boolean }) {
  const { locale, setLocale, t } = useLang();
  const pick = (l: Locale) => {
    if (l !== locale) {
      buzzLight();
      setLocale(l);
    }
  };
  return (
    <div
      role="group"
      aria-label={t.home.language}
      className={`inline-flex items-center rounded-full border border-stone-200/70 bg-white p-1 shadow-sm ${large ? "" : ""}`}
    >
      {(["id", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => pick(l)}
          aria-pressed={locale === l}
          className={`rounded-full font-display font-bold uppercase transition ${
            large ? "px-4 py-1.5 text-xs" : "px-2.5 py-1 text-[11px]"
          } ${locale === l ? "bg-pine text-[#FFF9F0] shadow-sm" : "text-stone-400"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
