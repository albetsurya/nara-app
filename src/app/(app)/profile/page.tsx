"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PreferencesCard } from "@/components/home/PreferencesCard";
import { MoodTrend } from "@/components/profile/MoodTrend";
import { VaultSection } from "@/components/profile/VaultSection";
import { useProfile } from "@/hooks/useJournal";
import { useSignOut } from "@/hooks/useSignOut";
import { useLang } from "@/lib/i18n";
import { Pip } from "@/components/pip/Pip";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/queries";
import { buzzLight } from "@/lib/haptics";
import { signOut as nextAuthSignOut } from "next-auth/react";

export default function ProfilePage() {
  const { t, fmt } = useLang();
  const qc = useQueryClient();
  const signOut = useSignOut();
  const { data: profile } = useProfile();
  const [savingName, setSavingName] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(profile?.companion_name ?? null);

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
    // Sign out from both NextAuth and Supabase session
    nextAuthSignOut({ callbackUrl: "/login" });
    signOut();
  };

  const saveCompanion = async (tag: string) => {
    if (!profile) return;
    setSavingName(true);
    try {
      const { error } = await createClient().from("profiles").update({ companion_name: tag }).eq("id", profile.id);
      if (!error) qc.invalidateQueries({ queryKey: keys.profile });
      setSelectedCompanion(tag);
    } finally {
      setSavingName(false);
    }
  };

  return (
    <main className="flex flex-col gap-4 py-1">
      <header className="sticky-top flex items-center justify-between">
        <p className="font-display text-xl font-bold text-pine">nara</p>
        <Link href="/profile" className="rounded-full border border-stone-200/70 bg-white p-2 shadow-sm transition active:scale-95">
        <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-stone-600" />
        </Link>
      </header>

      <section className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200/50 bg-white px-4 py-6 shadow-sm">
        <span className="grid h-24 w-24 place-items-center rounded-2xl border border-stone-200/50 bg-[#F3EDE2] shadow-sm">
          <Pip pose="wave" size={56} motion="breathe" companion={(profile?.companion_name as never) ?? selectedCompanion ?? "Pip"} />
        </span>
        <p className="font-display text-[17px] font-bold text-pine">{profile?.username ?? t.profile.guest}</p>
        <p className="font-sans text-xs text-stone-400">{t.profile.sub}</p>
      </section>

      <PreferencesCard username={profile?.username ?? null} onSaveName={saveName} savingName={savingName} />

      <MoodTrend />

      <VaultSection />

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

      <div className="mt-4 flex flex-col gap-2">
        <h2 className="font-display text-[13px] font-bold text-pine">{t.profile.companion}</h2>
        <div role="group" aria-label={t.profile.companion} className="inline-flex items-center rounded-full border border-stone-200/70 bg-white p-1 shadow-sm">
          {[
            ["playful", t.profile.companions?.[0]?.vibe ?? "Ringan dan ceria, bikin semuanya mudah."],
            ["gentle", t.profile.companions?.[1]?.vibe ?? "Hangat dan tenang, mendengar dulu."],
            ["steady", t.profile.companions?.[2]?.vibe ?? "Kalm dan mantap, bikin membumi."],
          ].map(([tag, label]) => (
            <button
              key={tag}
              onClick={() => {
                buzzLight();
                saveCompanion(tag);
              }}
              aria-pressed={selectedCompanion === tag}
              className={`rounded-full px-3 py-1 font-display text-[11px] font-bold transition ${selectedCompanion === tag ? "bg-pine text-[#FFF9F0] shadow-sm" : "text-stone-400"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="helpercopy text-center">{t.profile.version}</p>
    </main>
  );
}