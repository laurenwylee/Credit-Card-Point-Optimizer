// Cents of real value per point/mile earned, keyed by a card's earnCurrency.
// For cash-back cards the "multiplier" is a percentage, so 1 point = 1 cent.
//
// VALUATION TEAM: this is your integration point. Replace DEFAULT_VALUATIONS
// with your model's output (or pass a table into recommendCards) and every
// ranking updates automatically. Placeholder numbers are roughly in line with
// TPG/NerdWallet published valuations, early 2026.
export type ValuationTable = Record<string, number>;

export const DEFAULT_VALUATIONS: ValuationTable = {
  cashback: 1.0,
  "membership-rewards": 2.0,
  "ultimate-rewards": 2.05,
  "capital-one-miles": 1.85,
  "wells-fargo-rewards": 1.0,
  "us-bank-points": 1.0,
};

// Anything not in the table is treated as 1 cent per point.
export function centsPerPoint(earnCurrency: string, table: ValuationTable): number {
  return table[earnCurrency] ?? 1.0;
}
