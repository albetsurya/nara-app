import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth handles Google OAuth. The Google ID token is kept server-side in
 * the JWT and exchanged for a Supabase session in /api/auth/supabase-sync,
 * so Supabase RLS keeps working unchanged.
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google" && account.id_token) {
        (token as typeof token & { idToken?: string }).idToken = account.id_token;
      }
      // Also store the Google profile data for later profile sync
      if (account?.provider === "google") {
        const profile = account as { name?: string; email?: string; picture?: string } | null;
        if (profile) {
          token.name = profile.name;
          token.email = profile.email;
          token.picture = profile.picture;
        }
      }
      return token;
    },
    async session({ session }) {
      // ID token stays server-side; the client only needs to know it's signed in.
      return session;
    },
  },
};
