import { defaultCache } from "@serwist/next/worker";
import { NetworkFirst, Serwist, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Journal reads: try the network briefly, fall back to the last copy so
    // past entries stay readable offline. Cleared on sign-out (see useSignOut).
    {
      matcher: ({ url }) => url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/rest/v1/journals"),
      handler: new NetworkFirst({ cacheName: "nara-journals", networkTimeoutSeconds: 3 }),
    },
    ...defaultCache, // static assets, fonts, images, pages
  ],
  fallbacks: {
    entries: [{ url: "/~offline", matcher: ({ request }) => request.destination === "document" }],
  },
});

serwist.addEventListeners();

// Background Sync: when the OS wakes us after a reconnect, nudge the open
// tabs to flush the journal queue. The queue itself lives in localStorage,
// which a worker cannot read — so the tab does the actual syncing.
self.addEventListener("sync", (event) => {
  const e = event as unknown as { tag: string; waitUntil: (p: Promise<unknown>) => void };
  if (e.tag !== "nara-flush") return;
  e.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        list.forEach((c) => c.postMessage({ type: "nara-flush" }));
      }),
  );
});
