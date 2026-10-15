"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Pip } from "@/components/pip/Pip";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import { buzzLight, buzzSuccess } from "@/lib/haptics";

type Mode = "signin" | "signup";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.34A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(
    params.get("error") ? { kind: "error", text: t.login.authFailed } : null
  );

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
    buzzSuccess();
    if (data.session) { router.replace("/home"); router.refresh(); }
    else setMsg({ kind: "info", text: t.login.confirm });
  }

  async function magicLink() {
    if (!email) return setMsg({ kind: "error", text: t.login.needEmail });
    setBusy(true); setMsg(null);
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    setBusy(false);
    setMsg(error ? { kind: "error", text: error.message } : { kind: "info", text: t.login.sent });
  }

  async function google() {
    setBusy(true); setMsg(null);
    try {
      // NextAuth handles Google OAuth, then /api/auth/supabase-sync swaps the
      // Google ID token for a Supabase session (keeps RLS working).
      await signIn("google", { callbackUrl: "/api/auth/supabase-sync" });
    } catch {
      setBusy(false);
      setMsg({ kind: "error", text: t.login.oauthFailed });
    }
  }

  return (
    <>
      <h1 className="h-display mt-2">{mode === "signup" ? t.login.signupTitle : t.login.signinTitle}</h1>
      <p className="subcopy">{t.login.sub}</p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-2.5">
        <button type="button" onClick={() => { buzzLight(); google(); }} disabled={busy} className="btn-google w-full">
          <GoogleMark /> {t.login.google}
        </button>

        <div className="flex items-center gap-3 py-1" aria-hidden>
          <span className="h-px flex-1 bg-stone-200/70" />
          <span className="font-sans text-xs text-stone-400">{t.login.or}</span>
          <span className="h-px flex-1 bg-stone-200/70" />
        </div>

        <label className="block"><span className="sr-only">{t.login.email}</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.login.email} className="field" /></label>
        <label className="block"><span className="sr-only">{t.login.password}</span>
          <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.login.password} className="field" /></label>
        {msg && <p role={msg.kind === "error" ? "alert" : "status"} className={`text-center font-sans text-[13px] ${msg.kind === "error" ? "text-red-600" : "text-stone-500"}`}>{msg.text}</p>}
        <button disabled={busy} className="btn-primary mt-1 w-full">{busy ? t.login.busy : mode === "signup" ? t.login.create : t.login.signin}</button>
        <button type="button" onClick={() => { buzzLight(); magicLink(); }} disabled={busy} className="mx-auto py-1 font-display text-[13px] font-bold text-pine underline-offset-2 hover:underline">{t.login.magic}</button>
      </form>

      <div className="mt-auto flex flex-col items-center gap-1.5 pb-3 pt-4">
        <button onClick={() => { buzzLight(); setMode(mode === "signup" ? "signin" : "signup"); }} className="font-sans text-xs text-stone-500">
          {mode === "signup" ? `${t.login.haveAccount} ` : `${t.login.newHere} `}
          <span className="font-bold text-pine underline underline-offset-2">{mode === "signup" ? t.login.signin : t.login.createOne}</span>
        </button>
        <p className="helpercopy">{t.login.private}</p>
      </div>
    </>
  );
}

export default function Login() {
  return (
    <main className="pb-safe mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8">
      <div className="flex justify-end">
        <LocaleSwitch />
      </div>
      <p className="text-center font-display text-xl font-bold text-pine">nara</p>
      <span className="mx-auto mt-3 grid h-[104px] w-[104px] place-items-center"><Pip pose="wave" size={96} motion="breathe" /></span>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
