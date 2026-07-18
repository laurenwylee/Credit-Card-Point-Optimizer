import cardData from "@/data/cards.json";

export const SPEND_CATEGORIES = [
  "dining",
  "groceries",
  "gas",
  "travel",
  "flights",
  "hotels",
  "streaming",
  "transit",
  "drugstores",
  "entertainment",
  "online-shopping",
  "phone-plans",
  "other",
] as const;

export type SpendCategory = (typeof SPEND_CATEGORIES)[number];

export interface SpendBonus {
  spendBonusCategoryName: string;
  earnMultiplier: number;
  isSpendLimit: boolean;
  spendLimit?: number;
  spendLimitResetPeriod?: string;
  spendBonusDesc: string;
}

export interface Card {
  cardKey: string;
  cardName: string;
  cardIssuer: string;
  cardNetwork: string;
  annualFee: number;
  earnCurrency: string;
  baseSpendAmount: number;
  spendBonusCategory: SpendBonus[];
  signupBonusDesc?: string;
}

export const cards: Card[] = cardData.cards;

// Accepts sloppy inputs from the frontend ("restaurants", "Fuel") and resolves
// them to a canonical SpendCategory. Returns null for unrecognized input.
const CATEGORY_ALIASES: Record<string, SpendCategory> = {
  restaurants: "dining",
  restaurant: "dining",
  food: "dining",
  takeout: "dining",
  delivery: "dining",
  grocery: "groceries",
  supermarkets: "groceries",
  supermarket: "groceries",
  fuel: "gas",
  "gas-stations": "gas",
  flight: "flights",
  airfare: "flights",
  airlines: "flights",
  airline: "flights",
  hotel: "hotels",
  lodging: "hotels",
  subscriptions: "streaming",
  rideshare: "transit",
  parking: "transit",
  pharmacy: "drugstores",
  pharmacies: "drugstores",
  drugstore: "drugstores",
  shopping: "online-shopping",
  online: "online-shopping",
  "phone-plan": "phone-plans",
  phone: "phone-plans",
  cellphone: "phone-plans",
};

export function resolveCategory(input: string): SpendCategory | null {
  const slug = input.trim().toLowerCase().replace(/\s+/g, "-");
  if ((SPEND_CATEGORIES as readonly string[]).includes(slug)) {
    return slug as SpendCategory;
  }
  return CATEGORY_ALIASES[slug] ?? null;
}
