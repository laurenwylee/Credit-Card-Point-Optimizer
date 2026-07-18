# Credit Card Optimizer — Collaboration Plan

Last reviewed: July 18, 2026
Hackathon duration: 4 hours
Feature focus: Points valuation and redemption ranking

## 1. Current Project Status

### Repository

- Repository: `Credit-Card-Point-Optimizer`
- Application directory: `credit-card-point-optimizer`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Git branch: `main`
- Git state at last inspection: clean, with no staged, modified, or untracked files
- Backend/API routes: none
- Database: none
- Tests: none
- Reward, card, transaction, transfer, valuation, or recommendation models: none

### Work Already Completed

| Owner | Status | Work |
|---|---|---|
| Lauren / teammate | Done | Created the GitHub repository and initial README |
| Lauren / teammate | Done | Added the default Next.js React application scaffold |
| Team | Planned | Defined the high-level valuation, transfer-partner, ranking, and maintenance approach |
| Codex | Done | Inspected the repository, Git state, architecture, and likely edit-conflict areas |
| Codex | Done | Proposed an isolated `/points` feature architecture |
| Codex | Done | Implemented the local points valuation and redemption-ranking MVP |

The shared React homepage remains the default Create Next App screen. The points feature is isolated at `/points`. Any teammate work that exists only in an unsaved VS Code Live Share buffer will not appear in Git or filesystem inspection.

## 2. Is Scraping the Main Job?

No. Scraping should not be the main hackathon task.

The feature has three different data activities:

1. **Manual valuation transcription**
   - Copy current cents-per-point estimates from selected TPG or NerdWallet valuation posts.
   - Save the value, source URL, and last-updated date locally.
   - This is manual seed-data work, not scraping.

2. **Transfer-partner API integration**
   - Rewards CC has an officially documented, authenticated API for transfer-program lists and transfer-program cards.
   - Use the supported API from the Next.js server only; do not scrape the documentation site or call the API from the React browser client.
   - An active paid subscription is required. RapidAPI access uses `X-RapidAPI-Key` and `X-RapidAPI-Host`.
   - Normalize returned ratios and active bonuses into the same internal `TransferPartner` type used by local data.
   - API caching or storage is permitted only on the provider's MEGA and SUPREME plans. Confirm the subscription tier before caching any response.
   - The application must keep its independently maintained local fallback snapshot so an unavailable, unauthorized, rate-limited, or malformed response does not break the demo.

3. **Optional future scraping**
   - Automatically extracting monthly valuation articles would be scraping.
   - It is fragile, may violate publisher terms, and is unnecessary for the MVP.
   - Do not spend hackathon time on this unless every core feature is already complete.

Scraping is therefore one important workstream, but it is not the entire feature. The main engineering job is:

- Defining a stable valuation data model
- Normalizing transfer-partner data
- Calculating estimated redemption values
- Ranking close alternatives honestly
- Exposing the calculation through an API
- Building a React interface that displays the top recommendations

## 3. MVP Definition

A complete hackathon MVP lets a user:

1. Select a reward currency.
2. Enter a points balance.
3. See the estimated baseline dollar value.
4. Compare direct redemption and eligible transfer options.
5. See the top three options ranked by estimated dollar value.
6. See transfer ratio, bonus, destination valuation, and calculation details.
7. Receive a recommendation that warns that valuations are estimates.
8. Use the feature even when rewardscc.com cannot be scraped.

### Calculation

For direct redemption:

```text
estimated_value_usd = points × direct_cpp ÷ 100
```

For transfer partners:

```text
destination_points = points × transfer_ratio × (1 + bonus_percent ÷ 100)

estimated_value_usd = destination_points × destination_cpp ÷ 100
```

### Ranking Rules

- Sort options from highest estimated value to lowest.
- Return the top three options.
- Do not imply false precision.
- If two options are within 5% of each other, label them as a close call.
- Round displayed dollar values to two decimals.
- Keep full precision internally until final display formatting.
- Explain that availability, taxes, fees, and actual redemption price can change realized value.

## 4. Proposed Data Contracts

### Valuation Record

```ts
type PointValuation = {
  id: string;
  name: string;
  issuer: string;
  kind: "bank" | "airline" | "hotel";
  cpp: number;
  sourceName: string;
  sourceUrl: string;
  updatedAt: string;
  transferable: boolean;
};
```

### Transfer Partner Record

```ts
type TransferPartner = {
  sourceProgramId: string;
  destinationProgramId: string;
  transferRatio: number;
  bonusPercent: number;
  bonusEndsAt?: string;
  source: "rewardscc-api" | "local-fallback";
};
```

### Calculator Request

```ts
type PointsCalculationRequest = {
  programId: string;
  points: number;
};
```

### Ranked Option

```ts
type RankedRedemptionOption = {
  id: string;
  name: string;
  type: "direct" | "transfer";
  destinationProgramId?: string;
  transferRatio: number;
  bonusPercent: number;
  destinationPoints: number;
  cpp: number;
  estimatedValueUsd: number;
  closeCall: boolean;
};
```

### API Response

```ts
type PointsCalculationResponse = {
  programId: string;
  points: number;
  baselineValueUsd: number;
  topOptions: RankedRedemptionOption[];
  recommendation: string;
  valuationUpdatedAt: string;
  transferDataSource:
    | "rewardscc-api"
    | "local-fallback"
    | "not-applicable";
  disclaimer: string;
};
```

## 5. Recommended File Ownership

Keep the points feature additive so teammates can work without editing the same files.

### Points-Valuation Lane

Create:

- `lib/points/types.ts`
- `lib/points/valuations.ts`
- `lib/points/transfer-partners.ts`
- `lib/points/optimizer.ts`
- `app/api/points/route.ts`
- `app/points/PointsOptimizer.tsx`
- `app/points/page.tsx`

Owner: points-valuation feature developer

### Shared Frontend Lane

Likely shared files:

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`

Owner: agree in Live Share before editing

Do not modify these files for the initial points MVP. Build `/points` as a standalone route, then add homepage navigation after coordinating.

### Dependency Lane

Shared files:

- `package.json`
- `package-lock.json`

No new package should be needed for the points MVP. Coordinate before adding dependencies.

## 6. Task Board

| Priority | Task | Owner | Status | Notes |
|---|---|---|---|---|
| P0 | Agree on initial reward programs | Team | Done | Four requested bank currencies plus major airline and hotel programs |
| P0 | Seed local valuation records | Points lane (Codex) | Done | Includes cpp, source URL, and review date |
| P0 | Define TypeScript contracts | Points lane (Codex) | Done | API and UI share the same types |
| P0 | Implement pure calculator | Points lane (Codex) | Done | No network dependency |
| P0 | Rank and return top three | Points lane (Codex) | Done | Includes 5% close-call handling |
| P0 | Add local transfer fallback | Points lane (Codex) | Done | Required reliable demo path |
| P0 | Build `/api/points` | Points lane (Codex) | Done | GET metadata and validated POST calculation |
| P0 | Build `/points` React UI | Points lane (Codex) | Done | Prefilled with 60,000 Chase points |
| P0 | Run lint and production build | Points lane (Codex) | Done | Both pass |
| P1 | Inspect Rewards CC API and terms | Points lane (Codex) | Done | Official paid API confirmed; scraping is unnecessary |
| P1 | Add Rewards CC API adapter | Points lane | Blocked | Needs a paid subscription, server-only credentials, confirmed host/base URL, and caching-tier decision |
| P1 | Add homepage navigation | Frontend owner | To do | Coordinate shared-file edit |
| P1 | Add non-transferable guidance | Points lane (Codex) | Done | Airline/hotel balances receive direct-use guidance |
| P2 | Add known sweet spots | Data owner | Backlog | Requires defensible manually curated data |
| P2 | Automate monthly refresh | Team | Backlog | Manual update is preferred initially |
| P2 | Build article scraper | Team | Avoid for MVP | Fragile and possibly disallowed |

## 7. Suggested Initial Dataset

### Bank Currencies

- Chase Ultimate Rewards
- American Express Membership Rewards
- Citi ThankYou Points
- Capital One Miles

### Airline Programs

- Air Canada Aeroplan
- British Airways Club / Avios
- Flying Blue
- Singapore KrisFlyer
- Virgin Atlantic Flying Club
- United MileagePlus
- JetBlue TrueBlue

### Hotel Programs

- World of Hyatt
- Marriott Bonvoy
- Hilton Honors
- IHG One Rewards
- Choice Privileges
- Wyndham Rewards

All seed values are labeled as estimates and include a source URL and update date. They must not be presented as guaranteed redemption values.

## 8. Transfer-Partner API Strategy

Use an adapter boundary:

```ts
type TransferPartnerProvider = {
  getPartners(programId: string): Promise<TransferPartner[]>;
};
```

Implement two providers:

1. `RewardsCcApiTransferPartnerProvider`
2. `LocalTransferPartnerProvider`

Runtime behavior:

1. Call the documented transfer-program endpoints from the Next.js server with credentials stored only in server environment variables.
2. Read only the fields required for partner, ratio, and bonus data.
3. Validate and normalize the API records.
4. Cache or store successful results only when the active subscription tier explicitly permits it.
5. If the request is unavailable, unauthorized, rate-limited, or malformed, use the local fallback.
6. Return the data source in the API response.

Do not scrape rewardscc or expose the API key to the browser. The official API requires an active subscription and restricts caching/storage to specified plans. Before enabling the adapter, obtain the subscription, copy the exact base URL and host from the subscriber dashboard, store credentials in server-only environment variables, and confirm the selected plan's data-use rights. For the hackathon demo, the independently maintained local snapshot remains the reliable path.

## 9. Non-Transferable Programs

When the selected balance is already held by an airline or hotel:

- Do not generate transfer options.
- Show its estimated baseline value.
- Explain that the points generally cannot be transferred out.
- Ask what redemption the user is considering.
- Optionally show manually maintained sweet spots when reliable data exists.

For the MVP, baseline valuation plus guidance is sufficient. Sweet-spot recommendations are a later enhancement.

## 10. Collaboration Rules

1. Announce the file or folder you are taking before editing.
2. Prefer new feature-specific files over shared files.
3. Re-run `git status --short` before and after each work block.
4. Never overwrite another contributor's uncommitted changes.
5. Keep commits small and feature-specific.
6. Include the task identifier in commit messages when possible.
7. Do not add dependencies without team agreement.
8. Update this task board when work starts or finishes.
9. Keep live API failures from breaking the demo.
10. Treat all valuation numbers as editable data, not hard-coded business logic.

## 11. Four-Hour Cut Line

### First Hour

- Agree on program IDs and ownership.
- Seed a small valuation dataset.
- Define types and calculator behavior.

### Second Hour

- Implement calculation and ranking.
- Add fallback transfer mappings.
- Add API validation and response.

### Third Hour

- Build the `/points` React interface.
- Display top three, close calls, and disclaimers.
- Handle transferable and non-transferable programs.

### Final Hour

- Enable the Rewards CC API only if valid subscription credentials and plan permissions are available.
- Run lint and build.
- Test mock scenarios.
- Integrate navigation only after coordinating.
- Prepare the demo.

If Rewards CC credentials or plan permissions are unavailable at the start of the final hour, skip the live API and demo the reliable fallback.

## 12. Immediate Decisions Needed

1. Who owns the shared homepage and global styling?
2. Who will maintain valuation values after the hackathon?
3. Which Rewards CC subscription tier will the team use, and does it permit the required caching behavior?
4. Should Bilt be added in a later dataset expansion?
5. Is the demo expected to use only mock balances, or will another feature provide balances?

## 13. Definition of Done

The points feature is done when:

- A user can enter a valid balance.
- The four requested bank currencies and major airline/hotel programs are available.
- Every displayed valuation has source metadata and an update date.
- Direct and transfer options use the agreed formulas.
- The top three results are ranked correctly.
- Close results are clearly labeled.
- Non-transferable balances do not produce invalid transfer suggestions.
- The feature works without external APIs.
- The React page is usable during the demo.
- Lint and production build pass.

## 14. Branch Integration Note

Reviewed the merged `points-balance` work through `origin/main` commit `6262065` on July 18, 2026.

- The teammate work adds Supabase valuation, transfer-partner, and sweet-spot tables.
- The `feature/points-optimizer` branch adds the `/points` UI, `/api/points`, close-call ranking, non-transferable guidance, and a complete local fallback.
- The `/api/points` route now reads the teammate's Supabase tables first through a server-only bridge.
- If Supabase is not configured, unavailable, or has no usable transfer rows, the route automatically uses the local dataset.
- Generated `supabase/.temp/*` files were removed from tracking before the teammate work reached `main`.
- The feature branch is rebased onto the merged teammate work and passes lint, production build, and local-fallback runtime checks.
