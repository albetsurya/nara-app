"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faDesktop } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/lib/i18n";
import { buzzLight } from "@/lib/haptics";

/** Cycles light → dark → system. */
export function ThemeToggle({ iconOnly = true }: { iconOnly?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const order = ["light", "dark", "system"] as const;
  const current = theme ?? "system";
  const next = order[(order.indexOf(current as (typeof order)[number]) + 1) % order.length];
  const icon = !mounted
    ? faDesktop
    : resolvedTheme === "dark" && current !== "light"
      ? faMoon
      : current === "light"
        ? faSun
        : faDesktop;
  const label =
    current === "light" ? t.home.light : current === "dark" ? t.home.dark : t.home.system;

  return (
    <button
      onClick={() => {
        buzzLight();
        setTheme(next);
      }}
      aria-label={`${t.home.appearance}: ${label}`}
      title={`${t.home.appearance}: ${label}`}
      className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white text-stone-500 shadow-sm transition active:scale-95"
    >
      <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
      {!iconOnly && <span className="sr-only">{label}</span>}
    </button>
  );
}
