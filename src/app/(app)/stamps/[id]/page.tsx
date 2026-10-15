"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Stamp as StampArt } from "@/components/pip/PipAssets";
import { stampText } from "@/lib/stamps";
import { useLang } from "@/lib/i18n";

interface StampDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StampDetailPage({ params }: StampDetailPageProps) {
  const { id } = await params;
  const { t } = useLang();

  // For now, we'll use the stamp type from the ID
  // In a real app, you'd fetch from Supabase
  const stampType = id;
  const m = stampText({} as any, stampType);

  return (
    <main className="flex flex-col gap-4 py-1">
      <header className="sticky-top flex items-center justify-between">
        <Link href="/stamps" aria-label={t.common.back} className="grid h-9 w-9 place-items-center rounded-full border border-stone-200/70 bg-white shadow-sm transition active:scale-95"><FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5 text-stone-600" /></Link>
        <p className="font-display text-[15px] font-bold text-pine">{t.stamps.title}</p>
        <span className="w-9" />
      </header>

      <div className="flex flex-col items-center gap-4">
        <span className="grid h-32 w-32 place-items-center"><span className="svg-asset-wrapper" data-asset="stamp"><StampArt size={120} /></span></span>
        <div className="text-center">
          <h1 className="h-display-sm">{m.title}</h1>
          <p className="subcopy max-w-[280px]">{m.blurb}</p>
        </div>
        <p className="helpercopy font-display text-[10px] font-bold tracking-[0.14em] text-stone-500">
          {t.stamps.earnedAt || "Earned"}
        </p>
      </div>

      <Link href="/stamps" className="btn-primary w-full max-w-xs mx-auto mt-auto mb-4">
        {t.common.back}
      </Link>
    </main>
  );
}