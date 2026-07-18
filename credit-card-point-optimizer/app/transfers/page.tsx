import Link from "next/link";
import { redirect } from "next/navigation";
import { cards } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { TransfersWalletApp, type CardTransferResult } from "@/components/TransfersWalletApp";
import { optimizePointsWithDataSource } from "@/lib/points/data-provider";
import { CARD_CURRENCY_TO_PROGRAM_ID } from "@/lib/points/card-currency-map";

export default async function TransfersPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profile;
  try {
    profile = await loadOnboardingProfile(supabase, user.id);
  } catch {
    redirect("/onboarding");
  }
  if (!profile.completed) redirect("/onboarding");

  const ownedCards = cards.filter((card) => profile.cardKeys.includes(card.cardKey));

  const results: CardTransferResult[] = await Promise.all(
    ownedCards.map(async (card): Promise<CardTransferResult> => {
      const balance = profile.cardPointBalances[card.cardKey] ?? 0;
      if (balance <= 0) return { card, status: "no-balance" };
      if (card.earnCurrency === "cashback") return { card, status: "cashback" };

      const programId = CARD_CURRENCY_TO_PROGRAM_ID[card.earnCurrency];
      if (!programId) return { card, status: "unsupported" };

      const result = await optimizePointsWithDataSource({ programId, points: balance });
      return { card, status: "ranked", result };
    }),
  );

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader
        right={
          <Link
            className="rounded-full bg-[#16A34A] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#15803D]"
            href="/dashboard"
          >
            Dashboard
          </Link>
        }
      />
      <main className="pt-10">
        <TransfersWalletApp results={results} />
        <div className="mx-auto max-w-6xl border-t border-[#EEF0F3] px-6 pb-16 pt-6 text-sm leading-6 text-[#5B616E]">
          <p>
            Point values are estimates, not guaranteed cash values. Award availability, transfer
            times, taxes, fees, and the redemption price can change the value you actually receive.
          </p>
        </div>
      </main>
    </div>
  );
}
