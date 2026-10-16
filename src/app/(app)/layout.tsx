import { BottomNav } from "@/components/ui/BottomNav";
import { OfflineBar } from "@/components/ui/OfflineBar";
import { LockGate } from "@/components/ui/LockGate";

/** Shell for signed-in screens: offline status + scrollable content + floating bottom nav. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-safe min-h-dvh px-5 pb-28">
      <div className="pt-2">
        <OfflineBar />
      </div>
      {children}
      <BottomNav />
      <LockGate />
    </div>
  );
}
