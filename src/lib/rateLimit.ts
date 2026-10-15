/**
 * Tiny in-memory sliding-window rate limiter for LLM-backed routes.
 * Keyed per signed-in user (user id), so one spammer can't eat the Groq quota.
 * Best-effort on serverless (each instance keeps its own buckets) — good enough
 * to stop casual spamming; Supabase-level limits remain the backstop.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  if (buckets.size < 2000) return;
  for (const [k, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(k);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count < limit) {
    b.count += 1;
    return { ok: true, retryAfter: 0 };
  }
  return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
}
