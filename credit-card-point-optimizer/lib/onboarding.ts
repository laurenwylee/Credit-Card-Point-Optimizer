import { cards } from "@/lib/cards";
import type { SupabaseClient } from "@supabase/supabase-js";

export type OnboardingInput = {
  cardKeys: string[];
  cardPointBalances: Record<string, number>;
};

export type OnboardingProfile = OnboardingInput & {
  completed: boolean;
  completedAt: string | null;
};

type ValidationResult =
  | { success: true; data: OnboardingInput }
  | { success: false; error: string };

const validCardKeys = new Set(cards.map((card) => card.cardKey));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    selected.some((key) => typeof key !== "string" || !validCardKeys.has(key)) ||
    new Set(selected).size !== selected.length
  ) {
    return { success: false, error: "One or more selected cards are invalid." };
  }

  if (!isRecord(value.cardPointBalances)) {
    return { success: false, error: "Invalid points balances." };
  }
  const unknownBalanceKeys = Object.keys(value.cardPointBalances).filter(
    (cardKey) => !selected.includes(cardKey),
  );
  if (unknownBalanceKeys.length > 0) {
    return { success: false, error: "A points balance belongs to an unselected card." };
  }

  const cardPointBalances: Record<string, number> = {};
  for (const cardKey of selected) {
    const balance = value.cardPointBalances[cardKey] ?? 0;
    if (
      typeof balance !== "number" ||
      !Number.isSafeInteger(balance) ||
      balance < 0 ||
      balance > 1_000_000_000_000
    ) {
      return { success: false, error: "Points balances must be nonnegative whole numbers." };
    }
    cardPointBalances[cardKey] = balance;
  }

  return {
    success: true,
    data: { cardKeys: selected, cardPointBalances },
  };
}

export function emptyOnboardingProfile(): OnboardingProfile {
  return {
    completed: false,
    completedAt: null,
    cardKeys: [],
    cardPointBalances: {},
  };
}

export async function loadOnboardingProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<OnboardingProfile> {
  const [profileResult, cardsResult, balancesResult] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed_at").eq("user_id", userId).maybeSingle(),
    supabase.from("user_cards").select("card_key").eq("user_id", userId),
    supabase.from("reward_balances").select("card_key, balance").eq("user_id", userId),
  ]);
  const error = profileResult.error || cardsResult.error || balancesResult.error;
  if (error) throw new Error(error.message);

  const cardRows = (cardsResult.data ?? []) as Array<Record<string, unknown>>;
  const balanceRows = (balancesResult.data ?? []) as Array<Record<string, unknown>>;
  const completedAt = profileResult.data?.onboarding_completed_at as string | null | undefined;

  return {
    completed: Boolean(completedAt),
    completedAt: completedAt ?? null,
    cardKeys: cardRows.map((row) => String(row.card_key)),
    cardPointBalances: Object.fromEntries(
      balanceRows.map((row) => [String(row.card_key), Number(row.balance)]),
    ),
  };
}
