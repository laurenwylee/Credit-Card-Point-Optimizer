import assert from "node:assert/strict";
import { validateOnboardingInput } from "../lib/onboarding";

const validInput = {
  cardKeys: ["chase-sapphire-preferred", "chase-freedom-flex"],
  cardPointBalances: {
    "chase-sapphire-preferred": 60000,
    "chase-freedom-flex": 12500,
  },
};

assert.equal(validateOnboardingInput(validInput).success, true);
assert.equal(validateOnboardingInput({ ...validInput, cardKeys: [] }).success, false);
assert.equal(
  validateOnboardingInput({ ...validInput, cardKeys: ["unknown-card"] }).success,
  false,
);
assert.equal(
  validateOnboardingInput({
    ...validInput,
    cardPointBalances: { "chase-sapphire-preferred": -1 },
  }).success,
  false,
);
assert.equal(
  validateOnboardingInput({
    ...validInput,
    cardPointBalances: { "chase-sapphire-preferred": 12.5 },
  }).success,
  false,
);
assert.equal(
  validateOnboardingInput({
    ...validInput,
    cardPointBalances: { ...validInput.cardPointBalances, "amex-gold": 1000 },
  }).success,
  false,
);
assert.equal(
  validateOnboardingInput({ cardKeys: ["amex-gold"], cardPointBalances: {} }).success,
  true,
);

console.log("Onboarding validation tests passed.");
