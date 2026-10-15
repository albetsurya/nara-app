/** Minimal HTML helpers for journal content (stored as TipTap HTML). */
export function isHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/** Convert plain-text template (blank-line separated) into simple HTML paragraphs. */
export function textToHtml(text: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return "";
  return blocks.map((b) => `<p>${esc(b).replace(/\n/g, "<br>")}</p>`).join("");
}
