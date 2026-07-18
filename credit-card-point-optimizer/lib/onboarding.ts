import { cards, SPEND_CATEGORIES, type SpendCategory } from "@/lib/cards";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ROTATING_CARD_KEYS = [
  "chase-freedom-flex",
  "discover-it-cash-back",
] as const;

export const CHOICE_CARD_KEY = "bofa-customized-cash";
export const CHOICE_CATEGORIES: SpendCategory[] = [
  "online-shopping",
  "gas",
  "dining",
  "travel",
  "drugstores",
];

export const EARN_CURRENCY_TO_POINT_CURRENCY: Record<string, string> = {
  "membership-rewards": "amex_mr",
  "ultimate-rewards": "chase_ur",
  "capital-one-miles": "capital_one",
  cashback: "generic_cashback",
};

export type CardConfig = {
  bonusActivated?: boolean;
  choiceCategory?: SpendCategory;
};

export type OnboardingInput = {
  cardKeys: string[];
  cardConfigs: Record<string, CardConfig>;
  rewardBalances: Record<string, number>;
  monthlySpend: Record<SpendCategory, number>;
};

export type OnboardingProfile = OnboardingInput & {
  completed: boolean;
  completedAt: string | null;
};

type ValidationResult =
  | { success: true; data: OnboardingInput }
  | { success: false; error: string };

const cardKeys = new Set(cards.map((card) => card.cardKey));
const spendCategories = new Set<string>(SPEND_CATEGORIES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validMoney(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 10_000_000 &&
    Math.round(value * 100) === value * 100
  );
}

export function validateOnboardingInput(value: unknown): ValidationResult {
  if (!isRecord(value)) return { success: false, error: "Invalid request body." };

  if (!Array.isArray(value.cardKeys) || value.cardKeys.length === 0) {
    return { success: false, error: "Select at least one card." };
  }
  if (value.cardKeys.length > 20) {
    return { success: false, error: "Select no more than 20 cards." };
  }
  const selected = value.cardKeys;
  if (
    selected.some((key) => typeof key !== "string" || !cardKeys.has(key)) ||
    new Set(selected).size !== selected.length
  ) {
    return { success: false, error: "One or more selected cards are invalid." };
  }

  if (!isRecord(value.cardConfigs)) {
    return { success: false, error: "Invalid card settings." };
  }
  const normalizedConfigs: Record<string, CardConfig> = {};
  for (const [key, rawConfig] of Object.entries(value.cardConfigs)) {
    if (!selected.includes(key) || !isRecord(rawConfig)) {
      return { success: false, error: "Invalid card settings." };
    }
    const config: CardConfig = {};
    if (rawConfig.bonusActivated !== undefined) {
      if (typeof rawConfig.bonusActivated !== "boolean") {
        return { success: false, error: "Bonus activation must be true or false." };
      }
      config.bonusActivated = rawConfig.bonusActivated;
    }
    if (rawConfig.choiceCategory !== undefined) {
      if (
        typeof rawConfig.choiceCategory !== "string" ||
        !CHOICE_CATEGORIES.includes(rawConfig.choiceCategory as SpendCategory)
      ) {
        return { success: false, error: "Invalid choice category." };
      }
      config.choiceCategory = rawConfig.choiceCategory as SpendCategory;
    }
    normalizedConfigs[key] = config;
  }
  for (const key of ROTATING_CARD_KEYS) {
    if (selected.includes(key) && typeof normalizedConfigs[key]?.bonusActivated !== "boolean") {
      return { success: false, error: "Confirm whether rotating rewards are activated." };
    }
  }
  if (selected.includes(CHOICE_CARD_KEY) && !normalizedConfigs[CHOICE_CARD_KEY]?.choiceCategory) {
    return { success: false, error: "Choose the active Bank of America category." };
  }

  if (!isRecord(value.rewardBalances)) {
    return { success: false, error: "Invalid rewards balances." };
  }
  const selectedCurrencies = new Set(
    cards.filter((card) => selected.includes(card.cardKey)).map((card) => card.earnCurrency),
  );
  const normalizedBalances: Record<string, number> = {};
  for (const [currency, balance] of Object.entries(value.rewardBalances)) {
    if (
      !selectedCurrencies.has(currency) ||
      typeof balance !== "number" ||
      !Number.isSafeInteger(balance) ||
      balance < 0 ||
      balance > 1_000_000_000_000
    ) {
      return { success: false, error: "Rewards balances must be nonnegative whole numbers." };
    }
    normalizedBalances[currency] = balance;
  }

  if (!isRecord(value.monthlySpend)) {
    return { success: false, error: "Invalid monthly spending." };
  }
  const spendInput = value.monthlySpend;
  const unknownCategories = Object.keys(spendInput).filter(
    (category) => !spendCategories.has(category),
  );
  if (unknownCategories.length) {
    return { success: false, error: "One or more spending categories are invalid." };
  }
  const monthlySpend = Object.fromEntries(
    SPEND_CATEGORIES.map((category) => [category, spendInput[category] ?? 0]),
  ) as Record<SpendCategory, number>;
  if (Object.values(monthlySpend).some((amount) => !validMoney(amount))) {
    return { success: false, error: "Monthly spending must be a nonnegative amount with at most two decimals." };
  }
  if (!Object.values(monthlySpend).some((amount) => amount > 0)) {
    return { success: false, error: "Enter spending for at least one category." };
  }

  return {
    success: true,
    data: {
      cardKeys: selected,
      cardConfigs: normalizedConfigs,
      rewardBalances: normalizedBalances,
      monthlySpend,
    },
  };
}

export function emptyOnboardingProfile(): OnboardingProfile {
  return {
    completed: false,
    completedAt: null,
    cardKeys: [],
    cardConfigs: {},
    rewardBalances: {},
    monthlySpend: Object.fromEntries(
      SPEND_CATEGORIES.map((category) => [category, 0]),
    ) as Record<SpendCategory, number>,
  };
}

export async function loadOnboardingProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<OnboardingProfile> {
  const [profileResult, cardsResult, balancesResult, spendingResult] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed_at").eq("user_id", userId).maybeSingle(),
    supabase.from("user_cards").select("card_key, bonus_activated, choice_category").eq("user_id", userId),
    supabase.from("reward_balances").select("earn_currency, balance").eq("user_id", userId),
    supabase.from("monthly_spending").select("category, monthly_amount").eq("user_id", userId),
  ]);
  const error = profileResult.error || cardsResult.error || balancesResult.error || spendingResult.error;
  if (error) throw new Error(error.message);

  const empty = emptyOnboardingProfile();
  const cardRows = (cardsResult.data ?? []) as Array<Record<string, unknown>>;
  const balanceRows = (balancesResult.data ?? []) as Array<Record<string, unknown>>;
  const spendingRows = (spendingResult.data ?? []) as Array<Record<string, unknown>>;
  const completedAt = profileResult.data?.onboarding_completed_at as string | null | undefined;

  return {
    completed: Boolean(completedAt),
    completedAt: completedAt ?? null,
    cardKeys: cardRows.map((row) => String(row.card_key)),
    cardConfigs: Object.fromEntries(
      cardRows.map((row) => [
        String(row.card_key),
        {
          ...(row.bonus_activated !== null
            ? { bonusActivated: Boolean(row.bonus_activated) }
            : {}),
          ...(row.choice_category
            ? { choiceCategory: row.choice_category as SpendCategory }
            : {}),
        },
      ]),
    ),
    rewardBalances: Object.fromEntries(
      balanceRows.map((row) => [String(row.earn_currency), Number(row.balance)]),
    ),
    monthlySpend: {
      ...empty.monthlySpend,
      ...Object.fromEntries(
        spendingRows.map((row) => [String(row.category), Number(row.monthly_amount)]),
      ),
    },
  };
}
