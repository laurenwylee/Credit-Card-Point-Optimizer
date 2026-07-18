# Pointmaxxer — Credit Card Point Optimizer

Sign in, tell it which cards you have and how many points are on each, and it
recommends (a) which card to use for a purchase and (b) the best place to
redeem or transfer your points.

## How the app works

- **Auth** — Google OAuth via Supabase (`app/login`, `app/auth/callback`).
  Signing in creates a Supabase session cookie; every protected page/route
  reads the user from that session.
- **Onboarding** (`app/onboarding`) — after first sign-in, the user picks
  which cards they hold from the catalog in `data/cards.json` and manually
  enters the current point/cash-back balance on each one. This is stored per
  user in Supabase (`supabase/migrations/20260718000003_user_onboarding.sql`,
  `..._simplify_onboarding.sql`). There is no live balance-fetching
  integration — balances are only as fresh as what the user last typed in.
- **Dashboard** (`app/dashboard`) — summary of the signed-in user's wallet:
  cards held and total points entered, with links into the two optimizer
  flows below.
- **Best card for a purchase** (`app/purchases`, `lib/recommend.ts`,
  `app/api/recommend`) — ranks only the user's own onboarded cards against a
  spend category/amount using each card's earning multipliers from
  `data/cards.json`.
- **Best redemption/transfer** (`app/transfers`, `app/points`,
  `lib/points/optimizer.ts`) — for each card with a points balance, ranks
  transfer-partner and direct-redemption options by estimated value. Falls
  back to a bundled local valuation table (`lib/points/valuations.ts`,
  `lib/points/transfer-partners.ts`) if Supabase is unreachable.

## Data sources

| Data | Source | Freshness |
|---|---|---|
| Card catalog (earning rates, categories) | Rewards Credit Card API (rewardscc.com via RapidAPI), cached to `data/cards.json` by `npm run fetch-cards` | Snapshot, re-run script manually |
| Point valuations (cents-per-point) | Manually seeded in Supabase from TPG/NerdWallet monthly published valuations (`supabase/seed.sql`) | Manual, monthly |
| Transfer partner ratios/bonuses | Manually seeded in Supabase (`supabase/migrations/20260718000001_transfer_partners.sql`) | Manual |
| Card balances | User-entered during onboarding | As current as the user keeps it |

None of this refreshes automatically today — card data and point valuations
are both **manually updated snapshots**. Once this is wired to a paid
subscription API (for card data, a paid RapidAPI tier; for valuations, a
licensed data feed if one becomes available), these tables can be updated on
a schedule instead of by hand.

## Running it locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env template and fill in Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   You need `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   and `SUPABASE_SERVICE_ROLE_KEY` — get these from whoever set up the
   Supabase project. Google OAuth must also be enabled as a provider in that
   Supabase project's Auth settings.
3. Push the database schema and load seed data:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   npx supabase db execute -f supabase/seed.sql
   ```
   This applies all migrations in `supabase/migrations/`, including the
   points-valuation tables and the user-onboarding tables/RLS policies. The
   app intentionally refuses to run onboarding until those tables exist.
   The seeded valuations are placeholders — replace them with the current
   month's [TPG](https://thepointsguy.com/guide/monthly-valuations/) or
   NerdWallet numbers before relying on them for real decisions.
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
5. (Optional) Refresh the card catalog from the Rewards Credit Card API:
   ```bash
   # add RAPIDAPI_KEY=... to .env.local first
   npm run fetch-cards
   ```

## Scripts

- `npm run dev` / `npm run build` / `npm run start` — standard Next.js dev/build/serve.
- `npm run lint` — ESLint.
- `npm run fetch-cards` — refresh `data/cards.json` from the Rewards Credit Card API.
- `npm run test:onboarding` — asserts on `validateOnboardingInput` in `lib/onboarding.ts` (card-key/balance validation rules).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Auth (Next.js)](https://supabase.com/docs/guides/auth/server-side/nextjs)
