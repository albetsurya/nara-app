"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pip } from "@/components/pip/Pip";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const redirectTo = () => `${location.origin}/auth/callback`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const sb = createClient();
    const { data, error } = mode === "signup"
      ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo() } })
      : await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg({ kind: "error", text: error.message });
    if (data.session) { router.replace("/home"); router.refresh(); }
    else setMsg({ kind: "info", text: "Check your email to confirm, then come back here." });
  }

  async function magicLink() {
    if (!email) return setMsg({ kind: "error", text: "Add your email first." });
    setBusy(true); setMsg(null);
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    setBusy(false);
    setMsg(error ? { kind: "error", text: error.message } : { kind: "info", text: "Magic link sent. Check your inbox." });
  }

  return (
    <main className="pb-safe mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8">
      <p className="text-center font-display text-xl font-bold text-pine">nara</p>
      <span className="mx-auto mt-3 grid h-[104px] w-[104px] place-items-center"><Pip pose="wave" size={96} motion="breathe" /></span>
      <h1 className="h-display mt-2">{mode === "signup" ? "Make your space" : "Welcome back"}</h1>
      <p className="subcopy">A quiet place for your notes.</p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2.5">
        <label className="block"><span className="sr-only">Email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="field" /></label>
        <label className="block"><span className="sr-only">Password</span>
          <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" className="field" /></label>
        {msg && <p role={msg.kind === "error" ? "alert" : "status"} className={`text-center font-sans text-[13px] ${msg.kind === "error" ? "text-red-600" : "text-stone-500"}`}>{msg.text}</p>}
        <button disabled={busy} className="btn-primary mt-1 w-full">{busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}</button>
        <button type="button" onClick={magicLink} disabled={busy} className="mx-auto py-1 font-display text-[13px] font-bold text-pine underline-offset-2 hover:underline">Email me a magic link</button>
      </form>

      <div className="mt-auto flex flex-col items-center gap-1.5 pb-3 pt-4">
        <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="font-sans text-xs text-stone-500">
          {mode === "signup" ? "Have an account? " : "New here? "}
          <span className="font-bold text-pine underline underline-offset-2">{mode === "signup" ? "Sign in" : "Create one"}</span>
        </button>
        <p className="helpercopy">Private by default. Only you can read this.</p>
      </div>
    </main>
  );
}
