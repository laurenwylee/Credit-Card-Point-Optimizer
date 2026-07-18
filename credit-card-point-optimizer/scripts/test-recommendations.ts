import { calculateRedemptionOptions } from "@/lib/recommendations";
import type { PointValuation } from "@/lib/pointValuations";
import type { TransferPartner } from "@/lib/transferPartners";
import type { SweetSpot } from "@/lib/sweetSpots";

// Mirrors supabase/seed.sql so the test reflects real seeded values.
const valuations: PointValuation[] = [
  { currencyCode: "chase_ur", programName: "Chase Ultimate Rewards", category: "bank_transferable", centsPerPoint: 2.0, source: "TPG", sourceUrl: null, validMonth: "2026-07-01", notes: null },
  { currencyCode: "united_mileageplus", programName: "United MileagePlus", category: "airline", centsPerPoint: 1.3, source: "TPG", sourceUrl: null, validMonth: "2026-07-01", notes: null },
  { currencyCode: "hyatt_world_of_hyatt", programName: "World of Hyatt", category: "hotel", centsPerPoint: 1.7, source: "TPG", sourceUrl: null, validMonth: "2026-07-01", notes: null },
  { currencyCode: "southwest_rr", programName: "Southwest Rapid Rewards", category: "airline", centsPerPoint: 1.4, source: "TPG", sourceUrl: null, validMonth: "2026-07-01", notes: null },
];

const transferPartners: TransferPartner[] = [
  { fromCurrencyCode: "chase_ur", toCurrencyCode: "united_mileageplus", ratio: 1.0, bonusPct: 0, bonusExpiresAt: null, source: "manual", sourceUrl: null },
  { fromCurrencyCode: "chase_ur", toCurrencyCode: "hyatt_world_of_hyatt", ratio: 1.0, bonusPct: 0, bonusExpiresAt: null, source: "manual", sourceUrl: null },
  { fromCurrencyCode: "chase_ur", toCurrencyCode: "southwest_rr", ratio: 1.0, bonusPct: 30, bonusExpiresAt: "2026-08-01", source: "manual", sourceUrl: null },
];

const sweetSpots: SweetSpot[] = [
  { currencyCode: "hyatt_world_of_hyatt", title: "Category 1 off-peak night", pointsRequired: 3500, typicalCashValueUsd: 120, unit: "night" },
  { currencyCode: "hyatt_world_of_hyatt", title: "Category 4 standard night", pointsRequired: 12000, typicalCashValueUsd: 300, unit: "night" },
  { currencyCode: "united_mileageplus", title: "Saver economy round-trip (domestic)", pointsRequired: 25000, typicalCashValueUsd: 350, unit: "round-trip flight" },
];

const chaseUr = valuations.find((v) => v.currencyCode === "chase_ur")!;
const destinations = valuations.filter((v) => v.currencyCode !== "chase_ur");

const options = calculateRedemptionOptions(
  chaseUr,
  transferPartners,
  destinations,
  sweetSpots,
  60000
);

console.log("60,000 Chase Ultimate Rewards points — ranked options:\n");
for (const o of options) {
  console.log(
    `${o.type.padEnd(10)} ${o.programName.padEnd(24)} ${o.effectiveCentsPerPoint.toFixed(2)}cpp` +
      (o.transferBonusPct ? ` (+${o.transferBonusPct}% bonus)` : "") +
      (o.sweetSpotTitle ? ` — ${o.sweetSpotTitle}` : "") +
      ` -> $${o.estimatedValueUsd.toFixed(2)}`
  );
}
