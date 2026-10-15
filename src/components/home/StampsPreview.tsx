"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Stamp } from "@/components/pip/PipAssets";
import { createClient } from "@/lib/supabase/client";
import { fetchStampsPage, keys } from "@/lib/queries";
import { stampText } from "@/lib/stamps";
import { useLang } from "@/lib/i18n";

export default function StampsPreview() {
  const sb = createClient();
  const { t } = useLang();
  const { data } = useQuery({ queryKey: keys.stamps(0, 3), queryFn: () => fetchStampsPage(sb, 0, 3) });
  const rows = data?.rows ?? [];

  return (
    <section aria-labelledby="stamps-h" className="rounded-3xl border border-stone-200/50 bg-white p-4 text-center shadow-sm dark:bg-[#1E293B] dark:border-slate-700/60">
      <h2 id="stamps-h" className="font-display text-[15px] font-bold text-pine dark:text-slate-100">{t.home.yourStamps}</h2>
      {rows.length === 0 ? (
        <p className="mt-1 font-sans text-[13px] leading-relaxed text-stone-500 dark:text-slate-400">{t.home.stampsEmpty}</p>
      ) : (
        <ul className="mt-3 flex justify-center gap-3">
          {rows.map((s) => (
            <li key={s.id} className="flex flex-1 max-w-[100px] flex-col items-center justify-start text-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/40 dark:border-slate-700/60 p-1">
                <span className="svg-asset-wrapper" data-asset="stamp"><Stamp size={40} /></span>
              </span>
              <span className="mt-1.5 font-display text-[11px] font-bold leading-tight text-pine dark:text-slate-200 line-clamp-2 w-full break-words">
                {stampText(t, s.stamp_type).title}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/stamps" className="mt-3 inline-block font-display text-xs font-bold text-pine dark:text-slate-300 underline underline-offset-2">{t.home.seeAll}</Link>
    </section>
  );
}
