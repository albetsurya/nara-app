"use client";

import { useState } from "react";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PreferencesCard } from "@/components/home/PreferencesCard";
import { useProfile } from "@/hooks/useJournal";
import { useSignOut } from "@/hooks/useSignOut";
import { useLang } from "@/lib/i18n";
import { Pip } from "@/components/pip/Pip";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/queries";
import { buzzLight } from "@/lib/haptics";

export default function ProfilePage() {
  const { t } = useLang();
  const qc = useQueryClient();
  const signOut = useSignOut();
  const { data: profile } = useProfile();
  const [savingName, setSavingName] = useState(false);

  const saveName = async (name: string) => {
    if (!profile || savingName) return;
    setSavingName(true);
    try {
      const { error } = await createClient().from("profiles").update({ username: name || null }).eq("id", profile.id);
      if (!error) qc.invalidateQueries({ queryKey: keys.profile });
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = () => {
    buzzLight();
    signOut();
  };

  return (
    <main className="flex flex-col gap-4 py-1">
      <header className="sticky-top flex items-center justify-between">
        <p className="font-display text-xl font-bold text-pine">nara</p>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitch />
        </div>
      </header>

      <section className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200/50 bg-white px-4 py-6 shadow-sm">
        <span className="grid h-24 w-24 place-items-center rounded-2xl border border-stone-200/50 bg-[#F3EDE2] shadow-sm">
          <Pip pose="wave" size={56} motion="breathe" companion={(profile?.companion_name as never) ?? "Pip"} />
        </span>
        <p className="font-display text-[17px] font-bold text-pine">{profile?.username ?? t.profile.guest}</p>
        <p className="font-sans text-xs text-stone-400">{t.profile.sub}</p>
      </section>

      <PreferencesCard username={profile?.username ?? null} onSaveName={saveName} savingName={savingName} />

      <section className="rounded-3xl border border-stone-200/50 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-display text-[15px] font-bold text-pine">{t.profile.danger}</h2>
        <button onClick={handleSignOut} className="btn-soft w-full">
          <span className="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M14.5 4.5H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h8.5" stroke="#2F3B54" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 10.5L14 6.5M10 10.5L14 14.5M10 10.5H5.5" stroke="#2F3B54" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t.profile.signOut}
          </span>
        </button>
      </section>

      <p className="helpercopy text-center">{t.profile.version}</p>
    </main>
  );
}