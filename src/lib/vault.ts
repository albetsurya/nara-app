"use client";

import { useSyncExternalStore } from "react";
import {
  clearVaultMeta,
  getSessionPin,
  getVaultMeta,
  isVaultOn,
  randomSaltB64,
  setSessionPin,
  sha256hex,
  ssDel,
  ssGet,
  ssSet,
  storeVaultMeta,
  AUTO_LOCK_MS,
} from "./vaultCrypto";

export * from "./vaultCrypto";

const SS_AT = "nara:vault:unlockedAt";
const SS_HIDE = "nara:vault:hiddenAt";

const lockListeners = new Set<() => void>();
const notifyLock = () => lockListeners.forEach((l) => l());

export const isUnlocked = () => isVaultOn() && getSessionPin() !== null;

export async function unlockVault(pin: string): Promise<boolean> {
  const meta = getVaultMeta();
  if (!meta) return false;
  if ((await sha256hex(`${meta.salt}:${pin}`)) !== meta.ver) return false;
  setSessionPin(pin);
  ssSet(SS_AT, String(Date.now()));
  notifyLock();
  return true;
}

export function lockVault() {
  setSessionPin(null);
  ssDel(SS_AT);
  notifyLock();
}

/** Call when the tab hides; call checkVisibleAutoLock when it shows again. */
export function noteHidden() {
  if (isVaultOn() && getSessionPin()) ssSet(SS_HIDE, String(Date.now()));
}

export function checkVisibleAutoLock() {
  if (!isVaultOn() || !getSessionPin()) return;
  const h = Number(ssGet(SS_HIDE) ?? 0);
  ssDel(SS_HIDE);
  if (h && Date.now() - h > AUTO_LOCK_MS) lockVault();
}

export function useVaultLocked() {
  return useSyncExternalStore(
    (notify) => {
      lockListeners.add(notify);
      return () => {
        lockListeners.delete(notify);
      };
    },
    () => isVaultOn() && getSessionPin() === null,
    // Prerender assumes unlocked; the client corrects itself after hydration.
    () => false,
  );
}

export async function enableVault(pin: string) {
  const salt = randomSaltB64();
  storeVaultMeta(salt, await sha256hex(`${salt}:${pin}`));
  setSessionPin(pin);
  ssSet(SS_AT, String(Date.now()));
  notifyLock();
}

export async function rotateVaultPin(newPin: string) {
  const salt = randomSaltB64();
  storeVaultMeta(salt, await sha256hex(`${salt}:${newPin}`));
  setSessionPin(newPin);
  ssSet(SS_AT, String(Date.now()));
  notifyLock();
}

export function disableVault() {
  clearVaultMeta();
  lockVault();
}
