import assert from "node:assert/strict";
import { SPEND_CATEGORIES, type SpendCategory } from "../lib/cards";
import { validateOnboardingInput } from "../lib/onboarding";

const spending = Object.fromEntries(
  SPEND_CATEGORIES.map((category) => [category, category === "dining" ? 500 : 0]),
) as Record<SpendCategory, number>;

const validInput = {
  cardKeys: ["chase-sapphire-preferred", "chase-freedom-flex"],
  cardConfigs: { "chase-freedom-flex": { bonusActivated: true } },
  rewardBalances: { "ultimate-rewards": 60000 },
  monthlySpend: spending,
};

assert.equal(validateOnboardingInput(validInput).success, true);
assert.equal(validateOnboardingInput({ ...validInput, cardKeys: [] }).success, false);
assert.equal(
  validateOnboardingInput({ ...validInput, cardKeys: ["unknown-card"] }).success,
  false,
);
assert.equal(
  validateOnboardingInput({ ...validInput, cardConfigs: {} }).success,
  false,
);
assert.equal(
  validateOnboardingInput({
    ...validInput,
    rewardBalances: { "membership-rewards": 1000 },
  }).success,
  false,
);
assert.equal(
  validateOnboardingInput({
    ...validInput,
    monthlySpend: { ...spending, dining: 12.345 },
  }).success,
  false,
);
assert.equal(
  validateOnboardingInput({
    cardKeys: ["bofa-customized-cash"],
    cardConfigs: {},
    rewardBalances: {},
    monthlySpend: spending,
  }).success,
  false,
);

console.log("Onboarding validation tests passed.");
