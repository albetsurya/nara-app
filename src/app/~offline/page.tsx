import { PipSleepy } from "@/components/pip/PipAssets";

export default function Offline() {
  return (
    <main className="grid min-h-dvh place-items-center px-8 text-center">
      <div>
        <PipSleepy size={140} className="mx-auto" />
        <h1 className="mt-4 font-display text-2xl font-bold">You&apos;re offline</h1>
        <p className="mt-2 text-ink-soft">
          Pip is napping. Anything you write will be saved here and sent when you&apos;re back online.
        </p>
      </div>
    </main>
  );
}
