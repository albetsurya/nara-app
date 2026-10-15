"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faStamp, faComments, faUser } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import { fetchStampsPage, fetchProfile, fetchRecentJournals, keys } from "@/lib/queries";
import { useLang } from "@/lib/i18n";
import { buzzLight } from "@/lib/haptics";

/** Warm the RSC payload and the TanStack cache before the user taps. */
function useWarmRoute(href: string) {
  const router = useRouter();
  const qc = useQueryClient();
  return () => {
    try {
      router.prefetch(href);
    } catch {
      // prefetch is best effort
    }
    try {
      const sb = createClient();
      if (href.startsWith("/home")) {
        qc.prefetchQuery({ queryKey: keys.profile, queryFn: () => fetchProfile(sb), staleTime: 60_000 });
        qc.prefetchQuery({ queryKey: keys.recent, queryFn: () => fetchRecentJournals(sb), staleTime: 30_000 });
      } else if (href.startsWith("/stamps")) {
        qc.prefetchQuery({ queryKey: keys.stamps(0, 6), queryFn: () => fetchStampsPage(sb, 0, 6), staleTime: 30_000 });
        qc.prefetchQuery({ queryKey: keys.stamps(0, 3), queryFn: () => fetchStampsPage(sb, 0, 3), staleTime: 30_000 });
      }
    } catch {
      // cache warming is best effort
    }
  };
}

function Tab({
  href,
  label,
  icon,
  active,
  pending,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof faHouse;
  active: boolean;
  pending: boolean;
  onNavigate: (href: string) => void;
}) {
  const warm = useWarmRoute(href);
  return (
    <Link
      href={href}
      prefetch
      aria-current={active ? "page" : undefined}
      onMouseEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
      onClick={() => {
        buzzLight();
        onNavigate(href);
      }}
      className="flex h-full w-full flex-col items-center justify-center gap-[3px]"
    >
      <span
        className={`grid h-[30px] w-[52px] place-items-center rounded-full transition-colors ${
          active ? "bg-pine text-[#FFF9F0]" : pending ? "bg-pine-soft text-pine" : "text-stone-400"
        } ${pending && !active ? "animate-pulse" : ""}`}
      >
        <FontAwesomeIcon icon={icon} className="h-[17px] w-[17px] leading-none" />
      </span>
      <span className={`font-display text-[10.5px] leading-none ${active ? "font-bold text-pine" : "font-semibold text-stone-400"}`}>
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useLang();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [path]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      (["/home", "/stamps", "/chat", "/journal/new"] as const).forEach((href) => {
        try {
          router.prefetch(href);
        } catch {
          // ignore
        }
      });
      try {
        const sb = createClient();
        qc.prefetchQuery({ queryKey: keys.profile, queryFn: () => fetchProfile(sb), staleTime: 60_000 });
        qc.prefetchQuery({ queryKey: keys.recent, queryFn: () => fetchRecentJournals(sb), staleTime: 30_000 });
      } catch {
        // ignore
      }
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (typeof idle === "function") {
      const id = idle(run, { timeout: 2000 });
      return () => {
        cancelled = true;
        (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
      };
    }
    const timer = window.setTimeout(run, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router, qc]);

  const warmNew = useWarmRoute("/journal/new");
  const isNew = path.startsWith("/journal/new");
  const pendingNew = pendingHref === "/journal/new";

  return (
    <nav aria-label="Main" className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="grid h-[68px] grid-cols-[1fr_1fr_auto_1fr_1fr] items-center rounded-[28px] border border-stone-200/70 bg-white/95 px-2 shadow-float backdrop-blur">
        <Tab href="/home" label={t.nav.home} icon={faHouse} active={path.startsWith("/home")} pending={pendingHref === "/home"} onNavigate={setPendingHref} />
        <Tab href="/stamps" label={t.nav.stamps} icon={faStamp} active={path.startsWith("/stamps")} pending={pendingHref === "/stamps"} onNavigate={setPendingHref} />
        <div className="flex w-[64px] items-center justify-center">
          <Link
            href="/journal/new"
            prefetch
            aria-label={t.nav.write}
            aria-current={isNew ? "page" : undefined}
            onMouseEnter={warmNew}
            onTouchStart={warmNew}
            onFocus={warmNew}
            onClick={() => {
              buzzLight();
              setPendingHref("/journal/new");
            }}
            className={`grid h-[52px] w-[52px] place-items-center rounded-full shadow-md transition active:scale-95 ${
              isNew ? "bg-mint text-pine" : pendingNew ? "bg-pine-soft text-pine" : "bg-pine text-[#FFF9F0] hover:bg-pine-deep"
            } ${pendingNew && !isNew ? "animate-pulse" : ""}`}
          >
            <FontAwesomeIcon icon={faPlus} className="h-[20px] w-[20px] leading-none" />
          </Link>
        </div>
        <Tab href="/chat" label={t.nav.pip} icon={faComments} active={path.startsWith("/chat")} pending={pendingHref === "/chat"} onNavigate={setPendingHref} />
        <Tab href="/profile" label={t.nav.profile} icon={faUser} active={path.startsWith("/profile")} pending={pendingHref === "/profile"} onNavigate={setPendingHref} />
      </div>
    </nav>
  );
}
