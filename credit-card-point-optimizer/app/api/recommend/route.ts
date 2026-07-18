import { cards, resolveCategory, SPEND_CATEGORIES } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { recommendCards } from "@/lib/recommend";
import { getValuationTable } from "@/lib/valuations";
import { createClient } from "@/utils/supabase/server";

// GET /api/recommend?category=dining&amount=87.50&top=3
// Ranks only the signed-in user's own cards (from onboarding), not the full catalog.
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let profile;
  try {
    profile = await loadOnboardingProfile(supabase, user.id);
  } catch {
    return Response.json({ error: "Unable to load your cards." }, { status: 500 });
  }
  const userCards = cards.filter((card) => profile.cardKeys.includes(card.cardKey));

  const params = new URL(request.url).searchParams;

  const rawCategory = params.get("category");
  if (!rawCategory) {
    return Response.json(
      { error: "Missing required query param: category", validCategories: SPEND_CATEGORIES },
      { status: 400 }
    );
  }

  const category = resolveCategory(rawCategory);
  if (!category) {
    return Response.json(
      { error: `Unrecognized category: ${rawCategory}`, validCategories: SPEND_CATEGORIES },
      { status: 400 }
    );
  }

  const amountParam = params.get("amount");
  const amount = amountParam !== null ? Number(amountParam) : undefined;
  if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
    return Response.json({ error: `Invalid amount: ${amountParam}` }, { status: 400 });
  }

  const topParam = params.get("top");
  const topN = topParam !== null ? Number.parseInt(topParam, 10) : undefined;

  const valuations = await getValuationTable();
  const recommendations = recommendCards({ category, amount, topN, valuations, cards: userCards });
  return Response.json({ category, recommendations });
}
