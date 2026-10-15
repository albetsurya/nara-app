import { BottomNav } from "@/components/ui/BottomNav";

/** Shell for signed-in screens: scrollable content + floating bottom nav. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-safe min-h-dvh px-5 pb-28">
      {children}
      <BottomNav />
    </div>
  );
}
