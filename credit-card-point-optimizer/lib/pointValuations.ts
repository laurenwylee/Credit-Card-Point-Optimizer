import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PointCurrencyCategory =
  | "bank_transferable"
  | "airline"
  | "hotel"
  | "cashback";

export type PointValuation = {
  currencyCode: string;
  programName: string;
  category: PointCurrencyCategory;
  centsPerPoint: number;
  source: string;
  sourceUrl: string | null;
  validMonth: string;
  notes: string | null;
};

export async function getPointValuations(): Promise<PointValuation[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("point_valuations")
    .select(
      "currency_code, program_name, category, cents_per_point, source, source_url, valid_month, notes"
    )
    .order("cents_per_point", { ascending: false });

  if (error) {
    throw new Error(`Failed to load point valuations: ${error.message}`);
  }

  return data.map((row) => ({
    currencyCode: row.currency_code,
    programName: row.program_name,
    category: row.category,
    centsPerPoint: row.cents_per_point,
    source: row.source,
    sourceUrl: row.source_url,
    validMonth: row.valid_month,
    notes: row.notes,
  }));
}

export async function getPointValuation(
  currencyCode: string
): Promise<PointValuation | null> {
  const valuations = await getPointValuations();
  return valuations.find((v) => v.currencyCode === currencyCode) ?? null;
}
