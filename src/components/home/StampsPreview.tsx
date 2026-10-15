"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Stamp } from "@/components/pip/PipAssets";
import { createClient } from "@/lib/supabase/client";
import { fetchStampsPage, keys } from "@/lib/queries";
import { stampMeta } from "@/lib/stamps";
import { useLang } from "@/lib/i18n";

export default function StampsPreview() {
  const sb = createClient();
  const { t } = useLang();
  const { data } = useQuery({ queryKey: keys.stamps(0, 3), queryFn: () => fetchStampsPage(sb, 0, 3) });
  const rows = data?.rows ?? [];

  return (
    <section aria-labelledby="stamps-h" className="rounded-3xl border border-stone-200/50 bg-white p-4 text-center shadow-sm">
      <h2 id="stamps-h" className="font-display text-[15px] font-bold text-pine">{t.home.yourStamps}</h2>
      {rows.length === 0 ? (
        <p className="mt-1 font-sans text-[13px] leading-relaxed text-stone-500">{t.home.stampsEmpty}</p>
      ) : (
        <ul className="mt-3 flex justify-center gap-2">
          {rows.map((s) => (
            <li key={s.id} className="flex w-[76px] flex-col items-center text-center">
              <span className="grid h-16 w-16 place-items-center"><Stamp size={60} /></span>
              <span className="mt-1 font-display text-[11px] font-bold leading-tight text-pine">{stampMeta(s.stamp_type).title}</span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/stamps" className="mt-2 inline-block font-display text-xs font-bold text-pine underline underline-offset-2">{t.home.seeAll}</Link>
    </section>
  );
}
