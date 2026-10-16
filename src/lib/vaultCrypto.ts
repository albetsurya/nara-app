import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Vault primitives: AES-GCM + PBKDF2 + local salt. Deliberately React-free so
 * server components (via queries.ts) can import the decrypt path safely —
 * on the server there is simply no session PIN, so rows pass through.
 */

export const AUTO_LOCK_MS = 5 * 60_000;
const PREFIX = '{"v":"nara-enc-v1",';

const LS_ON = "nara:vault:on";
const LS_SALT = "nara:vault:salt";
const LS_VER = "nara:vault:ver";

let sessionPin: string | null = null;
export const getSessionPin = () => sessionPin;
export const setSessionPin = (p: string | null) => {
  sessionPin = p;
};

const inBrowser = () => typeof window !== "undefined";

export const lsGet = (k: string): string | null => {
  try {
    return inBrowser() ? window.localStorage.getItem(k) : null;
  } catch {
    return null;
  }
};
export const lsSet = (k: string, v: string) => {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    // storage unavailable — vault simply stays off
  }
};
export const lsDel = (k: string) => {
  try {
    window.localStorage.removeItem(k);
  } catch {
    // ignore
  }
};
export const ssGet = (k: string): string | null => {
  try {
    return inBrowser() ? window.sessionStorage.getItem(k) : null;
  } catch {
    return null;
  }
};
export const ssSet = (k: string, v: string) => {
  try {
    window.sessionStorage.setItem(k, v);
  } catch {
    // ignore
  }
};
export const ssDel = (k: string) => {
  try {
    window.sessionStorage.removeItem(k);
  } catch {
    // ignore
  }
};

export const getVaultMeta = (): { salt: string; ver: string } | null => {
  const salt = lsGet(LS_SALT);
  const ver = lsGet(LS_VER);
  return salt && ver ? { salt, ver } : null;
};

export const storeVaultMeta = (salt: string, ver: string) => {
  lsSet(LS_SALT, salt);
  lsSet(LS_VER, ver);
  lsSet(LS_ON, "1");
};

export const clearVaultMeta = () => {
  lsDel(LS_ON);
  lsDel(LS_SALT);
  lsDel(LS_VER);
};

const b64e = (b: Uint8Array<ArrayBuffer>): string => {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};
const b64d = (s: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function sha256hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const randomSaltB64 = (): string => b64e(crypto.getRandomValues(new Uint8Array(16)));

async function deriveKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(`nara:${pin}`), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export const isVaultOn = () => lsGet(LS_ON) === "1";
export const isVaultPayload = (s: unknown) => typeof s === "string" && s.startsWith(PREFIX);
export const validPin = (pin: string) => /^\d{4,8}$/.test(pin);

export async function encryptText(plain: string, pin: string): Promise<string> {
  const meta = getVaultMeta();
  if (!meta) throw new Error("vault not initialized");
  const key = await deriveKey(pin, b64d(meta.salt));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
  return JSON.stringify({ v: "nara-enc-v1", iv: b64e(iv), data: b64e(new Uint8Array(data)) });
}

export async function decryptText(payload: string, pin: string): Promise<string> {
  const meta = getVaultMeta();
  if (!meta) throw new Error("vault not initialized");
  const { iv, data } = JSON.parse(payload) as { iv: string; data: string };
  const key = await deriveKey(pin, b64d(meta.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64d(iv) },
    key,
    b64d(data),
  );
  return new TextDecoder().decode(plain);
}

/** Encrypt with the unlocked session PIN; passes plaintext through when off. */
export async function encryptWithSession(plain: string): Promise<string> {
  if (!isVaultOn() || isVaultPayload(plain)) return plain;
  if (!sessionPin) throw new Error("vault locked");
  return encryptText(plain, sessionPin);
}

/** Decrypt one row if it is a payload and we hold the session PIN. */
export async function decryptMaybe(content: string): Promise<string> {
  if (!isVaultPayload(content) || !sessionPin) return content;
  try {
    return await decryptText(content, sessionPin);
  } catch {
    return content;
  }
}

interface Row {
  id: string;
  content: string;
}

/** Plaintext -> ciphertext for every owned row (enable flow). */
export async function migrateAll(
  sb: SupabaseClient,
  opts: { toEncrypted: boolean; pin: string },
): Promise<{ done: number; failed: number }> {
  const { data, error } = await sb.from("journals").select("id, content").limit(2000);
  if (error) throw error;
  let done = 0;
  let failed = 0;
  for (const row of (data ?? []) as Row[]) {
    try {
      const c = row.content;
      let next: string | null = null;
      if (opts.toEncrypted && !isVaultPayload(c)) next = await encryptText(c, opts.pin);
      else if (!opts.toEncrypted && isVaultPayload(c)) next = await decryptText(c, opts.pin);
      if (next !== null) {
        const { error: uerr } = await sb.from("journals").update({ content: next }).eq("id", row.id);
        if (uerr) throw uerr;
        done++;
      }
    } catch {
      failed++;
    }
  }
  return { done, failed };
}

/** Ciphertext(old PIN) -> ciphertext(new PIN) for every owned row (change-PIN flow). */
export async function rekeyAll(
  sb: SupabaseClient,
  oldPin: string,
  newPin: string,
): Promise<{ done: number; failed: number }> {
  const { data, error } = await sb.from("journals").select("id, content").limit(2000);
  if (error) throw error;
  let done = 0;
  let failed = 0;
  for (const row of (data ?? []) as Row[]) {
    try {
      if (!isVaultPayload(row.content)) continue;
      const plain = await decryptText(row.content, oldPin);
      const next = await encryptText(plain, newPin);
      const { error: uerr } = await sb.from("journals").update({ content: next }).eq("id", row.id);
      if (uerr) throw uerr;
      done++;
    } catch {
      failed++;
    }
  }
  return { done, failed };
}
