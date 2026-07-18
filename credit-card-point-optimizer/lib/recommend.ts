import { cards, type Card, type SpendBonus, type SpendCategory } from "@/lib/cards";
import { centsPerPoint, DEFAULT_VALUATIONS, type ValuationTable } from "@/lib/valuations";

export interface Recommendation {
  cardKey: string;
  cardName: string;
  cardIssuer: string;
  annualFee: number;
  earnCurrency: string;
  multiplier: number;
  centsPerDollar: number;
  earnedCents?: number;
  rewardDesc: string;
  caveats: string[];
}

// Maps each bonus-category slug in cards.json to the query categories it
// satisfies, plus a caveat when the earn rate is conditional. A card-category
// like "travel" covers flights/hotels queries (generic travel bonuses apply to
// both), but a "flights" bonus only answers flights queries.
const BONUS_RULES: Record<string, { appliesTo: SpendCategory[]; caveat?: string }> = {
  dining: { appliesTo: ["dining"] },
  groceries: { appliesTo: ["groceries"] },
  "online-groceries": { appliesTo: ["groceries"], caveat: "Online grocery orders only" },
  gas: { appliesTo: ["gas"] },
  travel: { appliesTo: ["travel", "flights", "hotels"] },
  flights: { appliesTo: ["flights"] },
  hotels: { appliesTo: ["hotels"] },
  streaming: { appliesTo: ["streaming"] },
  transit: { appliesTo: ["transit"] },
  drugstores: { appliesTo: ["drugstores"] },
  entertainment: { appliesTo: ["entertainment"] },
  "phone-plans": { appliesTo: ["phone-plans"] },
  "chase-travel": {
    appliesTo: ["travel", "flights", "hotels"],
    caveat: "Requires booking through Chase Travel",
  },
  "capital-one-travel-hotels": {
    appliesTo: ["travel", "hotels"],
    caveat: "Requires booking through Capital One Travel",
  },
  "top-category": {
    appliesTo: ["dining", "groceries", "gas", "travel", "transit", "streaming", "drugstores", "entertainment"],
    caveat: "Only if this is your top spend category this billing cycle",
  },
  "choice-category": {
    appliesTo: ["dining", "gas", "travel", "drugstores", "online-shopping"],
    caveat: "Only if selected as your 3% choice category",
  },
};

// Rotating 5% categories change quarterly — update once per quarter.
// Q3 2026 assumptions for the demo.
const CURRENT_ROTATING: Partial<Record<string, SpendCategory>> = {
  "chase-freedom-flex": "gas",
  "discover-it-cash-back": "groceries",
};

function bonusApplies(card: Card, bonus: SpendBonus, category: SpendCategory): { applies: boolean; caveat?: string } {
  if (bonus.spendBonusCategoryName === "rotating") {
    return CURRENT_ROTATING[card.cardKey] === category
      ? { applies: true, caveat: "This quarter's rotating 5% category (activation required)" }
      : { applies: false };
  }
  const rule = BONUS_RULES[bonus.spendBonusCategoryName];
  if (!rule) return { applies: false };
  return { applies: rule.appliesTo.includes(category), caveat: rule.caveat };
}

export interface RecommendOptions {
  category: SpendCategory;
  amount?: number;
  topN?: number;
  valuations?: ValuationTable;
}

export function recommendCards({ category, amount, topN = 3, valuations = DEFAULT_VALUATIONS }: RecommendOptions): Recommendation[] {
  const recommendations = cards.map((card) => {
    let best: SpendBonus | undefined;
    let bestCaveat: string | undefined;
    for (const bonus of card.spendBonusCategory) {
      const { applies, caveat } = bonusApplies(card, bonus, category);
      if (applies && bonus.earnMultiplier > (best?.earnMultiplier ?? 0)) {
        best = bonus;
        bestCaveat = caveat;
      }
    }

    const multiplier = best && best.earnMultiplier > card.baseSpendAmount ? best.earnMultiplier : card.baseSpendAmount;
    const usedBonus = best && multiplier === best.earnMultiplier ? best : undefined;
    const rate = centsPerPoint(card.earnCurrency, valuations);
    const centsPerDollar = multiplier * rate;

    const caveats: string[] = [];
    if (usedBonus && bestCaveat) caveats.push(bestCaveat);
    if (usedBonus?.isSpendLimit && usedBonus.spendLimit) {
      caveats.push(`Bonus rate capped at $${usedBonus.spendLimit.toLocaleString()}/${usedBonus.spendLimitResetPeriod ?? "period"}`);
    }

    return {
      cardKey: card.cardKey,
      cardName: card.cardName,
      cardIssuer: card.cardIssuer,
      annualFee: card.annualFee,
      earnCurrency: card.earnCurrency,
      multiplier,
      centsPerDollar: Math.round(centsPerDollar * 100) / 100,
      ...(amount !== undefined && { earnedCents: Math.round(centsPerDollar * amount) }),
      rewardDesc: usedBonus?.spendBonusDesc ?? `${card.baseSpendAmount}x base rate on all purchases`,
      caveats,
    };
  });

  return recommendations.sort((a, b) => b.centsPerDollar - a.centsPerDollar).slice(0, topN);
}
