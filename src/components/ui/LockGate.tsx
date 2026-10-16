"use client";

import { useEffect, useState } from "react";
import { Pip } from "@/components/pip/Pip";
import { useLang } from "@/lib/i18n";
import { buzzLight, buzzSuccess } from "@/lib/haptics";
import {
  checkVisibleAutoLock,
  noteHidden,
  unlockVault,
  useVaultLocked,
} from "@/lib/vault";

/** Full-screen PIN gate. Renders nothing unless the vault is enabled and locked. */
export function LockGate() {
  const locked = useVaultLocked();
  const { t } = useLang();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") noteHidden();
      else checkVisibleAutoLock();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!locked) {
      setPin("");
      setError(false);
    }
  }, [locked ]);

  if (!locked) return null;

  const press = (d: string) => {
    buzzLight();
    setError(false);
    setPin((p) => (p.length < 8 ? p + d : p));
  };

  const submit = async () => {
    if (pin.length < 4 || busy) return;
    setBusy(true);
    const ok = await unlockVault(pin).catch(() => false);
    setBusy(false);
    if (ok) {
      buzzSuccess();
      setPin("");
    } else {
      buzzLight();
      setError(true);
      setPin("");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.profile.unlockTitle}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-canvas/95 px-6 py-8 dark:bg-[#141A26]/95"
    >
      <div className="w-full max-w-xs text-center">
        <Pip pose="sleepy" size={96} motion="none" className="mx-auto" />
        <h1 className="h-display mt-2">{t.profile.unlockTitle}</h1>
        <p className="subcopy">{t.profile.unlockSub}</p>

        <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${i < pin.length ? "bg-pine" : "bg-stone-200 dark:bg-slate-700"}`}
            />
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 font-sans text-[13px] text-red-600">
            {t.profile.pinWrong}
          </p>
        )}

        <div className="mx-auto mt-3 grid max-w-[240px] grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="grid h-14 place-items-center rounded-2xl border border-stone-200/70 bg-white font-display text-lg font-bold text-pine shadow-sm transition active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => {
              buzzLight();
              setError(false);
              setPin("");
            }}
            aria-label={t.common.close}
            className="grid h-14 place-items-center rounded-2xl border border-stone-200/70 bg-white font-display text-sm font-bold text-stone-500 shadow-sm transition active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            C
          </button>
          <button
            onClick={() => press("0")}
            className="grid h-14 place-items-center rounded-2xl border border-stone-200/70 bg-white font-display text-lg font-bold text-pine shadow-sm transition active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            0
          </button>
          <button
            onClick={() => {
              buzzLight();
              setPin((p) => p.slice(0, -1));
            }}
            aria-label={t.common.back}
            className="grid h-14 place-items-center rounded-2xl border border-stone-200/70 bg-white font-display text-lg font-bold text-stone-500 shadow-sm transition active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            ⌫
          </button>
        </div>

        <button
          onClick={submit}
          disabled={pin.length < 4 || busy}
          className={pin.length >= 4 && !busy ? "btn-primary mt-3 w-full" : "btn-disabled mt-3 w-full"}
        >
          {busy ? t.common.saving : t.profile.unlockBtn}
        </button>
      </div>
    </div>
  );
}
