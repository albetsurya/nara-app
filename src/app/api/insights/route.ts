import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

const PROMPT_EN = (digest: string) => `You are Pip, a kind journaling companion. Below are someone's journal notes from the last 14 days (mood + snippet each).

Find 2-3 gentle patterns: recurring feelings, small wins, things that seem to help, or quiet growth. Keep it warm, brief, and non-judgmental. No diagnoses, no medical advice. Write as short bullet lines starting with "- ", no intro, no outro, max 60 words total. Answer in English.

Notes:
${digest}`;

const PROMPT_ID = (digest: string) => `Kamu adalah Pip, teman jurnal yang baik hati. Di bawah ini catatan jurnal seseorang dari 14 hari terakhir (suasana hati + cuplikan).

Temukan 2-3 pola yang lembut: perasaan yang berulang, kemenangan kecil, hal yang tampaknya membantu, atau pertumbuhan yang tenang. Hangat, singkat, tidak menghakimi. Tanpa diagnosis, tanpa nasihat medis. Tulis sebagai baris-baris pendek diawali "- ", tanpa pembuka, tanpa penutup, maksimal 60 kata. Jawab dalam Bahasa Indonesia.

Catatan:
${digest}`;

export async function POST(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`insights:${user.id}`, 12, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retry_after: rl.retryAfter },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => null);
  const locale = body?.locale === "id" ? "id" : "en";

  const key = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ insight: null });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const { data: journals } = await sb
    .from("journals")
    .select("content, mood, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const recent = (journals ?? []).filter((j) => new Date(j.created_at) >= cutoff);
  if (recent.length < 3) return NextResponse.json({ insight: null });

  const digest = recent
    .map((j) => `- [${j.created_at.slice(0, 10)} · ${j.mood}] ${j.content.replace(/<[^>]*>/g, " ").slice(0, 280)}`)
    .join("\n");

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
        max_tokens: 250,
        messages: [{ role: "user", content: locale === "id" ? PROMPT_ID(digest) : PROMPT_EN(digest) }],
      }),
    });
    if (!res.ok) return NextResponse.json({ insight: null });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? null;
    return NextResponse.json({ insight: text || null });
  } catch {
    return NextResponse.json({ insight: null });
  }
}
