// Maps a card's earnCurrency (lib/cards.ts, data/cards.json) to the matching
// lib/points program id (lib/points/valuations.ts). The two catalogs were
// built independently and use different id schemes.
export const CARD_CURRENCY_TO_PROGRAM_ID: Partial<Record<string, string>> = {
  "ultimate-rewards": "chase-ultimate-rewards",
  "membership-rewards": "amex-membership-rewards",
  "capital-one-miles": "capital-one-miles",
  "wells-fargo-rewards": "wells-fargo-rewards",
  "us-bank-points": "us-bank-points",
};
