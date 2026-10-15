"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { buzzLight } from "@/lib/haptics";
import { useTheme } from "next-themes";

/** Language + appearance + display name, all in one card. */
export function PreferencesCard({
  username,
  onSaveName,
  savingName,
}: {
  username: string | null;
  onSaveName: (name: string) => void;
  savingName: boolean;
}) {
  const { t } = useLang();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(username ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setName(username ?? ""), [username]);

  const dirty = name.trim() !== (username ?? "").trim();

  return (
    <section aria-label={t.home.prefs} className="sticker p-4">
      <h2 className="text-center font-display text-[15px] font-bold text-pine">{t.home.prefs}</h2>

      <label htmlFor="display-name" className="eyebrow mt-3 block">
        {t.home.displayName}
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          placeholder={t.home.displayNamePh}
          maxLength={30}
          className="field !py-2.5"
        />
        <button
          onClick={() => {
            buzzLight();
            onSaveName(name.trim());
          }}
          disabled={!dirty || savingName}
          className="shrink-0 rounded-full bg-pine px-4 font-display text-[13px] font-bold text-[#FFF9F0] shadow-sm transition active:scale-95 disabled:opacity-40"
        >
          {savingName ? "..." : t.common.save}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-display text-[13px] font-bold text-pine">{t.home.language}</span>
        <LocaleSwitch />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="font-display text-[13px] font-bold text-pine">{t.home.appearance}</span>
        <div role="group" aria-label={t.home.appearance} className="inline-flex items-center rounded-full border border-stone-200/70 bg-white p-1 shadow-sm">
          {(
            [
              ["light", t.home.light],
              ["dark", t.home.dark],
              ["system", t.home.system],
            ] as [string, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => {
                buzzLight();
                setTheme(v);
              }}
              aria-pressed={mounted && theme === v}
              className={`rounded-full px-3 py-1 font-display text-[11px] font-bold transition ${
                mounted && theme === v ? "bg-pine text-[#FFF9F0] shadow-sm" : "text-stone-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
