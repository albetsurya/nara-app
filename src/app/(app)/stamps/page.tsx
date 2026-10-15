"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Pip } from "@/components/pip/Pip";
import { Stamp as StampArt } from "@/components/pip/PipAssets";
import { createClient } from "@/lib/supabase/client";
import { fetchStampsPage, keys } from "@/lib/queries";
import { stampMeta } from "@/lib/stamps";
import { useLang } from "@/lib/i18n";

const PAGE_SIZE = 6;

export default function StampsPage() {
  const sb = createClient();
  const { t, fmt } = useLang();
  const [pageIndex, setPageIndex] = useState(0);

  const { data, isPlaceholderData } = useQuery({
    queryKey: keys.stamps(pageIndex, PAGE_SIZE),
    queryFn: () => fetchStampsPage(sb, pageIndex, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex flex-col gap-4 py-1">
      <div className="sticky-top">
        <h1 className="h-display">{t.stamps.title}</h1>
        <p className="subcopy">{t.stamps.sub}</p>
      </div>

      {total === 0 && !isPlaceholderData ? (
        <section className="flex flex-col items-center rounded-3xl border border-stone-200/50 bg-white px-4 py-6 text-center shadow-sm">
          <span className="grid h-20 w-20 place-items-center opacity-40 grayscale"><StampArt size={72} /></span>
          <h2 className="mt-2 font-display text-[16px] font-bold text-pine">{t.stamps.emptyTitle}</h2>
          <p className="mt-1 max-w-[240px] font-sans text-[13px] leading-relaxed text-stone-500">{t.stamps.emptySub}</p>
          <Pip pose="peek" size={96} motion="none" className="mt-2" />
        </section>
      ) : (
        <section aria-label="Stamp collection" className={isPlaceholderData ? "opacity-60 transition" : "transition"}>
          <ul className="grid grid-cols-2 gap-2.5">
            {rows.map((s, index) => {
              const m = stampMeta(s.stamp_type);
              return (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22, delay: index * 0.08 }}
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex cursor-pointer flex-col items-center rounded-3xl border border-stone-200/50 bg-[#F3EDE2] p-4 text-center shadow-sm"
                >
                  <motion.span
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="grid h-16 w-16 place-items-center"
                  >
                    <StampArt size={60} />
                  </motion.span>
                  <p className="mt-2 font-display text-[13.5px] font-bold leading-snug on-tint">{m.title}</p>
                  <p className="mt-0.5 font-sans text-[11.5px] leading-snug on-tint-soft">{m.blurb}</p>
                  <time className="mt-1.5 font-display text-[10px] font-bold tracking-[0.12em] on-tint-soft">{new Date(s.earned_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                </motion.li>
              );
            })}
          </ul>
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-3 flex items-center justify-between">
              <button className="rounded-full border border-stone-200/70 bg-white px-4 py-2 font-display text-[13px] font-bold text-pine shadow-sm disabled:opacity-40" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>{t.stamps.back}</button>
              <span className="font-sans text-xs text-stone-400">{fmt(t.stamps.pageOf, { a: pageIndex + 1, b: pages })}</span>
              <button className="rounded-full border border-stone-200/70 bg-white px-4 py-2 font-display text-[13px] font-bold text-pine shadow-sm disabled:opacity-40" onClick={() => setPageIndex((p) => p + 1)} disabled={pageIndex + 1 >= pages || isPlaceholderData}>{t.stamps.next}</button>
            </nav>
          )}
        </section>
      )}
      <p className="helpercopy">{t.stamps.footer}</p>
    </main>
  );
}
