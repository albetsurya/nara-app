"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pip } from "@/components/pip/Pip";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import { buzzLight, buzzSuccess } from "@/lib/haptics";

type Mode = "signin" | "signup";

export default function Login() {
  const router = useRouter();
  const { t } = useLang();
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

  return (
    <main className="pb-safe mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8">
      <div className="flex justify-end">
        <LocaleSwitch />
      </div>
      <p className="text-center font-display text-xl font-bold text-pine">nara</p>
      <span className="mx-auto mt-3 grid h-[104px] w-[104px] place-items-center"><Pip pose="wave" size={96} motion="breathe" /></span>
      <h1 className="h-display mt-2">{mode === "signup" ? t.login.signupTitle : t.login.signinTitle}</h1>
      <p className="subcopy">{t.login.sub}</p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2.5">
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
    </main>
  );
}
