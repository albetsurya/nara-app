# Nara

Your thoughts, ideas, and stories. All welcome here.

## Run it
```bash
npm install
cp .env.example .env.local        # add Supabase URL + anon key
# Run supabase/schema.sql in the Supabase SQL editor
# Supabase → Auth → URL config: add http://localhost:3000/auth/callback
npm run dev                       # service worker is disabled in dev
npm run build && npm start        # test the PWA / offline behaviour here
```
`build` uses `next build --webpack` because Serwist needs webpack (not Turbopack).

## Ponytail
`npx skill add dietrichgebert/ponytail`

## Structure
```
src/app
  onboarding/ login/ ~offline/      public screens
  (app)/home|journal/new|stamps|chat  signed-in screens (shared nav layout)
  api/chat/route.ts                 Pip's replies (Anthropic API, server-only key)
  auth/callback/route.ts            magic-link + confirm-email landing
  sw.ts                             Serwist service worker
src/components/pip   PipAssets.tsx (your art) + Pip.tsx (motion wrapper)
src/lib              queries, moods, stamps, offline queue, supabase clients
supabase/schema.sql  tables, RLS, profile + stamp triggers
```
