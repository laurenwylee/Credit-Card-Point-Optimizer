import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SweetSpot = {
  currencyCode: string;
  title: string;
  pointsRequired: number;
  typicalCashValueUsd: number;
  unit: string;
};

export async function getSweetSpots(
  currencyCodes: string[]
): Promise<SweetSpot[]> {
  if (currencyCodes.length === 0) return [];

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("sweet_spots")
    .select("currency_code, title, points_required, typical_cash_value_usd, unit")
    .in("currency_code", currencyCodes);

  if (error) {
    throw new Error(`Failed to load sweet spots: ${error.message}`);
  }

  return data.map((row) => ({
    currencyCode: row.currency_code,
    title: row.title,
    pointsRequired: row.points_required,
    typicalCashValueUsd: row.typical_cash_value_usd,
    unit: row.unit,
  }));
}
