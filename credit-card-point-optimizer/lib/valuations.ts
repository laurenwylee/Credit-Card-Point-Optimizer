import { getPointValuations } from "@/lib/pointValuations";

// Cents of real value per point/mile earned, keyed by a card's earnCurrency.
// For cash-back cards the "multiplier" is a percentage, so 1 point = 1 cent.
//
// Placeholder numbers are roughly in line with TPG/NerdWallet published
// valuations, early 2026. getValuationTable() below overrides these with the
// live Supabase-backed point_valuations table (see lib/pointValuations.ts)
// where a mapping exists, and falls back to these defaults otherwise —
// including when Supabase is unreachable, so recommend.ts keeps working.
export type ValuationTable = Record<string, number>;

export const DEFAULT_VALUATIONS: ValuationTable = {
  cashback: 1.0,
  "membership-rewards": 2.0,
  "ultimate-rewards": 2.05,
  "capital-one-miles": 1.85,
  "wells-fargo-rewards": 1.0,
  "us-bank-points": 1.0,
};

// Maps a card's earnCurrency slug (data/cards.json) to the point_valuations
// currency_code it corresponds to. Wells Fargo / US Bank points have no
// row yet, so they keep using the placeholder default.
const EARN_CURRENCY_TO_POINT_CURRENCY: Record<string, string> = {
  cashback: "generic_cashback",
  "membership-rewards": "amex_mr",
  "ultimate-rewards": "chase_ur",
  "capital-one-miles": "capital_one",
};

export async function getValuationTable(): Promise<ValuationTable> {
  const table: ValuationTable = { ...DEFAULT_VALUATIONS };

  let liveValuations: Awaited<ReturnType<typeof getPointValuations>>;
  try {
    liveValuations = await getPointValuations();
  } catch {
    return table;
  }

  for (const [earnCurrency, currencyCode] of Object.entries(EARN_CURRENCY_TO_POINT_CURRENCY)) {
    const match = liveValuations.find((v) => v.currencyCode === currencyCode);
    if (match) table[earnCurrency] = match.centsPerPoint;
  }

  return table;
}

// Anything not in the table is treated as 1 cent per point.
export function centsPerPoint(earnCurrency: string, table: ValuationTable): number {
  return table[earnCurrency] ?? 1.0;
}
