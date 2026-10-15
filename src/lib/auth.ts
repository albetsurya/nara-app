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
      return token;
    },
    async session({ session }) {
      // ID token stays server-side; the client only needs to know it's signed in.
      return session;
    },
  },
};
