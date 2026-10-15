import { NextResponse } from "next/server";

/**
 * Liveness probe for uptime monitors (UptimeRobot & friends).
 * Reports only booleans — never secret values.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    services: {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      ai: !!(process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY),
    },
  });
}
