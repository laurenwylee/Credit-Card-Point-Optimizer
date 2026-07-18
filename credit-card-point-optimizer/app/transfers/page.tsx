import Link from "next/link";
import { redirect } from "next/navigation";
import { cards, type Card } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { RedemptionOptionCard } from "@/components/RedemptionOptionCard";
import { optimizePointsWithDataSource } from "@/lib/points/data-provider";
import { CARD_CURRENCY_TO_PROGRAM_ID } from "@/lib/points/card-currency-map";
import type { PointsCalculationResponse } from "@/lib/points/types";

const pointFormatter = new Intl.NumberFormat("en-US");

type CardTransferResult =
  | { card: Card; status: "ranked"; result: PointsCalculationResponse }
  | { card: Card; status: "no-balance" }
  | { card: Card; status: "cashback" }
  | { card: Card; status: "unsupported" };

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
    <div className="min-h-screen bg-white text-[#0A0B0D]">
      <SiteHeader
        right={
          <Link
            className="rounded-full bg-[#F5F6F8] px-3.5 py-1.5 text-[13px] font-medium text-[#5B616E] hover:bg-[#EEF0F3]"
            href="/dashboard"
          >
            Dashboard
          </Link>
        }
      />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0052FF]">
            Transfer recommendations
          </p>
          <h1 className="mt-4 text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#0A0B0D] sm:text-6xl">
            Best places to send your points.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5B616E]">
            Ranked using the point balances you entered for each of your cards.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          {results.length === 0 ? (
            <p className="text-[#5B616E]">
              You haven&apos;t added any cards yet.{" "}
              <Link className="font-semibold text-[#0052FF]" href="/onboarding?edit=1">
                Add cards
              </Link>{" "}
              to see transfer recommendations.
            </p>
          ) : null}

          {results.map((entry) => (
            <section key={entry.card.cardKey}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-[#0A0B0D]">
                  {entry.card.cardName}
                </h2>
                {entry.status === "ranked" ? (
                  <span className="text-sm text-[#5B616E]">
                    {pointFormatter.format(entry.result.points)} points
                  </span>
                ) : null}
              </div>

              {entry.status === "no-balance" ? (
                <p className="mt-2 text-sm text-[#9AA0AA]">
                  No points balance entered for this card yet.{" "}
                  <Link className="font-semibold text-[#0052FF]" href="/onboarding?edit=1">
                    Add a balance
                  </Link>
                  .
                </p>
              ) : null}

              {entry.status === "cashback" ? (
                <p className="mt-2 text-sm text-[#9AA0AA]">
                  Cash back is always worth 1¢ per point — there&apos;s nothing to transfer.
                </p>
              ) : null}

              {entry.status === "unsupported" ? (
                <p className="mt-2 text-sm text-[#9AA0AA]">
                  Transfer valuations for this card&apos;s currency aren&apos;t available yet.
                </p>
              ) : null}

              {entry.status === "ranked" ? (
                <>
                  <p className="mt-2 max-w-2xl text-sm text-[#5B616E]">
                    {entry.result.recommendation}
                  </p>
                  <div className="mt-4 grid gap-5 lg:grid-cols-3">
                    {entry.result.topOptions.map((option, index) => (
                      <RedemptionOptionCard key={option.id} option={option} rank={index + 1} />
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-14 border-t border-[#EEF0F3] pt-6 text-sm leading-6 text-[#5B616E]">
          <p>
            Point values are estimates, not guaranteed cash values. Award availability, transfer
            times, taxes, fees, and the redemption price can change the value you actually receive.
          </p>
        </div>
      </main>
    </div>
  );
}
