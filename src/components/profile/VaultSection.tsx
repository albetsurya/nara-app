"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import { buzzLight, buzzSuccess } from "@/lib/haptics";
import {
  disableVault,
  enableVault,
  isVaultOn,
  migrateAll,
  rekeyAll,
  rotateVaultPin,
  unlockVault,
  validPin,
} from "@/lib/vault";

const digits = (s: string) => s.replace(/\D/g, "").slice(0, 8);

/** Opt-in PIN encryption + change/disable, with existing rows migrated. */
export function VaultSection() {
  const { t } = useLang();
  const qc = useQueryClient();
  const [on, setOn] = useState(isVaultOn);
  const [changing, setChanging] = useState(false);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ error: boolean; text: string } | null>(null);

  const done = () => {
    qc.invalidateQueries({ queryKey: ["journals"] });
    qc.invalidateQueries({ queryKey: ["stamps"] });
  };

  const enable = async () => {
    if (!validPin(pin)) return setMsg({ error: true, text: t.profile.pinNeedDigits });
    if (pin !== confirm) return setMsg({ error: true, text: t.profile.pinMismatch });
    setBusy(true);
    setMsg(null);
    try {
      const sb = createClient();
      await enableVault(pin);
      await migrateAll(sb, { toEncrypted: true, pin });
      setOn(true);
      setPin("");
      setConfirm("");
      buzzSuccess();
      done();
    } catch {
      setMsg({ error: true, text: t.profile.lockFail });
    } finally {
      setBusy(false);
    }
  };

  const change = async () => {
    if (!validPin(pin)) return setMsg({ error: true, text: t.profile.pinNeedDigits });
    if (pin !== confirm) return setMsg({ error: true, text: t.profile.pinMismatch });
    setBusy(true);
    setMsg(null);
    try {
      const sb = createClient();
      const ok = await unlockVault(oldPin);
      if (!ok) {
        setMsg({ error: true, text: t.profile.pinWrong });
        return;
      }
      await rekeyAll(sb, oldPin, pin);
      await rotateVaultPin(pin);
      setChanging(false);
      setPin("");
      setConfirm("");
      setOldPin("");
      buzzSuccess();
      done();
    } catch {
      setMsg({ error: true, text: t.profile.lockFail });
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (!validPin(pin)) return setMsg({ error: true, text: t.profile.pinNeedDigits });
    setBusy(true);
    setMsg(null);
    try {
      const sb = createClient();
      const ok = await unlockVault(pin);
      if (!ok) {
        setMsg({ error: true, text: t.profile.pinWrong });
        return;
      }
      await migrateAll(sb, { toEncrypted: false, pin });
      disableVault();
      setOn(false);
      setChanging(false);
      setPin("");
      setConfirm("");
      buzzSuccess();
      done();
    } catch {
      setMsg({ error: true, text: t.profile.lockFail });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label={t.profile.lockTitle} className="sticker p-4">
      <h2 className="text-center font-display text-[15px] font-bold text-pine">{t.profile.lockTitle}</h2>
      <p className="mt-0.5 text-center font-sans text-xs text-stone-500">{t.profile.lockSub}</p>

      {!on ? (
        <div className="mt-3">
          <label htmlFor="vault-pin" className="eyebrow block">{t.profile.setPin}</label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="vault-pin"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              value={pin}
              onChange={(e) => setPin(digits(e.target.value))}
              placeholder={t.profile.pinPh}
              maxLength={8}
              className="field !py-2.5"
            />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              aria-label={t.profile.pinConfirmPh}
              value={confirm}
              onChange={(e) => setConfirm(digits(e.target.value))}
              placeholder={t.profile.pinConfirmPh}
              maxLength={8}
              className="field !py-2.5"
            />
          </div>
          <p className="mt-2 font-sans text-[11px] leading-relaxed text-stone-400">{t.profile.lockWarn}</p>
          {msg && (
            <p role="alert" className={`mt-2 text-center font-sans text-[13px] ${msg.error ? "text-red-600" : ""}`}>
              {msg.text}
            </p>
          )}
          <button
            onClick={() => {
              buzzLight();
              enable();
            }}
            disabled={busy}
            className="btn-soft mt-2 w-full !h-[48px] !text-sm"
          >
            {busy ? t.profile.working : t.profile.enablePin}
          </button>
        </div>
      ) : changing ? (
        <div className="mt-3">
          <label htmlFor="vault-old" className="eyebrow block">{t.profile.changePin}</label>
          <div className="mt-1.5 flex flex-col gap-2">
            <input
              id="vault-old"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={oldPin}
              onChange={(e) => setOldPin(digits(e.target.value))}
              placeholder={t.profile.oldPinPh}
              maxLength={8}
              className="field !py-2.5"
            />
            <div className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                aria-label={t.profile.newPinPh}
                value={pin}
                onChange={(e) => setPin(digits(e.target.value))}
                placeholder={t.profile.newPinPh}
                maxLength={8}
                className="field !py-2.5"
              />
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                aria-label={t.profile.pinConfirmPh}
                value={confirm}
                onChange={(e) => setConfirm(digits(e.target.value))}
                placeholder={t.profile.pinConfirmPh}
                maxLength={8}
                className="field !py-2.5"
              />
            </div>
          </div>
          {msg && (
            <p role="alert" className={`mt-2 text-center font-sans text-[13px] ${msg.error ? "text-red-600" : ""}`}>
              {msg.text}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                buzzLight();
                setChanging(false);
                setMsg(null);
              }}
              className="btn-soft flex-1 !h-[48px] !text-sm"
            >
              {t.common.back}
            </button>
            <button
              onClick={() => {
                buzzLight();
                change();
              }}
              disabled={busy}
              className="shrink-0 rounded-full bg-pine px-4 font-display text-[13px] font-bold text-[#FFF9F0] shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              {busy ? "..." : t.common.save}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-center font-sans text-[13px] text-stone-500">{t.profile.lockedOn}</p>
          <label htmlFor="vault-cur" className="eyebrow mt-2 block">{t.profile.oldPinPh}</label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="vault-cur"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(digits(e.target.value))}
              placeholder={t.profile.pinPh}
              maxLength={8}
              className="field !py-2.5"
            />
            <button
              onClick={() => {
                buzzLight();
                setChanging(true);
                setMsg(null);
              }}
              className="shrink-0 rounded-full border border-stone-200/70 bg-white px-4 font-display text-[13px] font-bold text-pine shadow-sm transition active:scale-95"
            >
              {t.profile.changePin}
            </button>
          </div>
          {msg && (
            <p role="alert" className={`mt-2 text-center font-sans text-[13px] ${msg.error ? "text-red-600" : ""}`}>
              {msg.text}
            </p>
          )}
          <button
            onClick={() => {
              buzzLight();
              disable();
            }}
            disabled={busy}
            className="btn-soft mt-2 w-full !h-[48px] !text-sm"
          >
            {busy ? t.profile.working : t.profile.disablePin}
          </button>
        </div>
      )}
    </section>
  );
}
