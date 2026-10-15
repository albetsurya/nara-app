/** Light haptic tap. No-op where vibration isn't supported. */
export function buzz(pattern: number | number[] = 12) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
}

export const buzzLight = () => buzz(10);
export const buzzSuccess = () => buzz([12, 40, 20]);
