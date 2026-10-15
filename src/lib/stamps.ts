import type { Dict } from "./i18n";

export const STAMP_META: Record<string, { title: string; blurb: string }> = {
  first_entry: { title: "Your first stamp", blurb: "You wrote your first entry." },
  three_day: { title: "Three in a row", blurb: "Journaled 3 days in a row." },
  seven_day: { title: "A whole week", blurb: "Journaled 7 days in a row." },
  ten_entries: { title: "Ten thoughts", blurb: "Ten entries and counting." },
};
export const stampMeta = (t: string) => STAMP_META[t] ?? { title: "New stamp", blurb: "Something worth keeping." };

/** Locale-aware stamp text; falls back to English meta for unknown types. */
export const stampText = (d: Dict, type: string) =>
  (d.stampsMeta as Record<string, { title: string; blurb: string }>)[type] ?? d.stampsMeta.fallback;
