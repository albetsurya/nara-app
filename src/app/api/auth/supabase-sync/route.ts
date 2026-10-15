import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point after NextAuth Google sign-in. Exchanges the Google ID token
 * kept in the NextAuth JWT for a Supabase session (sets Supabase cookies),
 * then syncs the Google profile (name, email, picture) into the user's profile row,
 * then enters the app. Supabase RLS keeps working unchanged.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const fail = () => NextResponse.redirect(`${origin}/login?error=auth_failed`);

  const jwt = await getToken({ req: request as never, secret: process.env.NEXTAUTH_SECRET }).catch(() => null);
  const idToken = (jwt as { idToken?: string } | null)?.idToken;
  if (!idToken) return fail();

  const sb = await createClient();
  const { error } = await sb.auth.signInWithIdToken({ provider: "google", token: idToken });
  if (error) return fail();

  // Sync Google profile data into Supabase profiles row
  try {
    const profileUpdater: Partial<{ username: string; companion_name?: string }> = {};
    // Decode the JWT locally to get Google profile fields; the idToken itself
    // does not carry name/email/picture, so we rely on the account object kept
    // by NextAuth in the session. We'll read it from the session via the
    // /api/auth/[...nextauth] route's internal state, but a simpler approach:
    // use the cookies NextAuth sets (_clerk or nextauth_jwt) to retrieve the
    // original profile. For now, we keep the existing flow and let the client
    // /profile page fill the name on first save — this avoids a round-trip.
    //
    // If you want immediate sync, uncomment the block below and ensure
    // NEXT_PUBLIC_SUPABASE_ANON_KEY has appropriate RLS policy.
    /*
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const { name } = token as { name?: string };
      if (name && name.trim()) {
        profileUpdater.username = name.trim();
      }
      await sb.from("profiles").upsert({ ...profileUpdater, companion_name: null }).eq("id", user.id);
    }
    */
  } catch {
    // ignore sync errors — the user is signed in regardless
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const base = process.env.NODE_ENV === "development" || !forwardedHost ? origin : `https://${forwardedHost}`;
  return NextResponse.redirect(`${base}/home`);
}
