import { resolveCategory, SPEND_CATEGORIES } from "@/lib/cards";
import { recommendCards } from "@/lib/recommend";

// GET /api/recommend?category=dining&amount=87.50&top=3
export async function GET(request: Request) {
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

  const recommendations = recommendCards({ category, amount, topN });
  return Response.json({ category, recommendations });
}
