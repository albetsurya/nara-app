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

  async function signInWithGoogle() {
    setBusy(true); setMsg(null);
    const sb = createClient();
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setBusy(false);
      setMsg({ kind: "error", text: error.message });
    }
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
        <button type="button" onClick={signInWithGoogle} disabled={busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-stone-200/70 bg-white py-2.5 font-display text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-50">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.82 0 12s.43 3.88 1.18 5.4l4.09-3.16z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          Continue with Google
        </button>
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
