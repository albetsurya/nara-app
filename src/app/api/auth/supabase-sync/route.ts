import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point after NextAuth Google sign-in. Exchanges the Google ID token
 * kept in the NextAuth JWT for a Supabase session (sets Supabase cookies),
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

  const forwardedHost = request.headers.get("x-forwarded-host");
  const base = process.env.NODE_ENV === "development" || !forwardedHost ? origin : `https://${forwardedHost}`;
  return NextResponse.redirect(`${base}/home`);
}
