import { createServerSupabaseClient } from "@/lib/supabase/server";

export type TransferPartner = {
  fromCurrencyCode: string;
  toCurrencyCode: string;
  ratio: number;
  bonusPct: number;
  bonusExpiresAt: string | null;
  source: string;
  sourceUrl: string | null;
};

export async function getTransferPartners(
  fromCurrencyCode: string
): Promise<TransferPartner[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("transfer_partners")
    .select(
      "from_currency_code, to_currency_code, ratio, bonus_pct, bonus_expires_at, source, source_url"
    )
    .eq("from_currency_code", fromCurrencyCode);

  if (error) {
    throw new Error(`Failed to load transfer partners: ${error.message}`);
  }

  return data.map((row) => ({
    fromCurrencyCode: row.from_currency_code,
    toCurrencyCode: row.to_currency_code,
    ratio: row.ratio,
    bonusPct: row.bonus_pct,
    bonusExpiresAt: row.bonus_expires_at,
    source: row.source,
    sourceUrl: row.source_url,
  }));
}
