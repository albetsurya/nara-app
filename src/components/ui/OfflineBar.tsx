"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faWifi } from "@fortawesome/free-solid-svg-icons";
import { queuedCount } from "@/lib/offlineQueue";
import { useLang } from "@/lib/i18n";

/** Thin banner under the header when offline or entries are waiting to sync. */
export function OfflineBar() {
  const { t, fmt } = useLang();
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setOnline(navigator.onLine);
      try {
        setQueued(queuedCount());
      } catch {
        setQueued(0);
      }
    };
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    const id = window.setInterval(refresh, 5000);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.clearInterval(id);
    };
  }, []);

  if (online && queued === 0) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 rounded-full border border-amber-200/60 bg-[#FFF6D4] px-4 py-2 text-center shadow-sm"
    >
      <FontAwesomeIcon icon={online ? faCloudArrowUp : faWifi} className="h-3.5 w-3.5 shrink-0 text-amber-700" />
      <p className="font-sans text-xs font-medium leading-snug text-amber-900">
        {!online ? t.offline.msg : fmt(t.offline.queue, { n: queued })}
      </p>
    </div>
  );
}
