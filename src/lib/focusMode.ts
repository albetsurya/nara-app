import { useSyncExternalStore } from "react";

/**
 * Cross-component Focus Mode flag. The writing page sets it; BottomNav hides
 * itself while it is on. Module-level so no provider plumbing is needed.
 */

let focus = false;
const listeners = new Set<() => void>();

export function setFocusMode(v: boolean) {
  if (focus === v) return;
  focus = v;
  listeners.forEach((l) => l());
}

export function useFocusMode() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => {
        listeners.delete(notify);
      };
    },
    () => focus,
    // Server never renders in focus mode; the client takes over after hydration.
    () => false,
  );
}
