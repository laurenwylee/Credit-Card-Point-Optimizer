import type { Card } from "@/lib/cards";
import { centsPerPoint, type ValuationTable } from "@/lib/valuations";

export interface SignupNudge {
  cardKey: string;
  cardName: string;
  spend: number;
  months: number;
  bonusLabel: string;
  valueDollars: number;
}

// Picks the richest welcome offer in the given card set, valuing point
// bonuses through the same valuation table the rankings use.
export function bestSignupNudge(cards: Card[], valuations: ValuationTable): SignupNudge | null {
  let best: SignupNudge | null = null;
  for (const card of cards) {
    const bonus = card.signupBonus;
    if (!bonus) continue;
    const valueDollars =
      bonus.cash ?? ((bonus.points ?? 0) * centsPerPoint(card.earnCurrency, valuations)) / 100;
    if (!best || valueDollars > best.valueDollars) {
      best = {
        cardKey: card.cardKey,
        cardName: card.cardName,
        spend: bonus.spend,
        months: bonus.months,
        bonusLabel: bonus.cash
          ? `$${bonus.cash.toLocaleString()}`
          : `${(bonus.points ?? 0).toLocaleString()} points`,
        valueDollars: Math.round(valueDollars),
      };
    }
  }
  return best;
}
