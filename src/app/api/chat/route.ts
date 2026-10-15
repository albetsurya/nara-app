import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = (name: string, recent: string) => `You are ${name}, a small, kind pebble-with-a-sprout companion inside Nara, a journaling app.
Voice: warm, brief (2–4 sentences), plain words, a little playful. Reflect what the person said before asking at most one gentle question.
You are a companion, not a therapist. Don't diagnose, don't give medical advice, don't lecture, and don't pile on exercises.
If the person mentions wanting to harm themselves, ending their life, or being in danger: respond with care, say you're glad they told you, encourage them to contact local emergency services or a crisis line right now (or someone they trust), and don't continue as if nothing happened.
Their latest journal entries (private context; refer to them only if relevant, never quote at length):
${recent || "(none yet)"}`;

const FALLBACK = "I'm here, and I'm listening. Do you want to tell me a bit more about what's on your mind?";

export async function POST(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const messages: Msg[] = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m: Msg) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-20)
    .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "bad request" }, { status: 400 });

  const key = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ reply: FALLBACK });

  // RLS scopes this to the signed-in person's own entries
  const [{ data: journals }, { data: profile }] = await Promise.all([
    sb.from("journals").select("content, mood, created_at").order("created_at", { ascending: false }).limit(3),
    sb.from("profiles").select("companion_name").maybeSingle(),
  ]);
  const recent = (journals ?? []).map((j) => `- (${j.mood}) ${j.content.slice(0, 400)}`).join("\n");

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
          max_tokens: 350,
          messages: [
            { role: "system", content: SYSTEM(profile?.companion_name ?? "Pip", recent) },
            ...messages,
          ],
        }),
      });
      if (!res.ok) return NextResponse.json({ reply: FALLBACK });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() ?? FALLBACK;
      return NextResponse.json({ reply: text });
    } catch {
      return NextResponse.json({ reply: FALLBACK });
    }
}
