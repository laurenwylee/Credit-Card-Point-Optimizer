"use client";

import { useState } from "react";
import type { Card } from "@/lib/cards";
import type { PointsCalculationResponse } from "@/lib/points/types";
import { WalletStack } from "@/components/WalletStack";
import { RedemptionOptionCard } from "@/components/RedemptionOptionCard";

export type CardTransferResult =
  | { card: Card; status: "ranked"; result: PointsCalculationResponse }
  | { card: Card; status: "no-balance" }
  | { card: Card; status: "cashback" }
  | { card: Card; status: "unsupported" };

const pointFormatter = new Intl.NumberFormat("en-US");

export function TransfersWalletApp({ results }: { results: CardTransferResult[] }) {
  const cards = results.map((entry) => entry.card);
  const resultsByKey = new Map(results.map((entry) => [entry.card.cardKey, entry]));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selected = selectedKey ? resultsByKey.get(selectedKey) : undefined;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0">
        <h1 className="max-w-xl text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#0A0B0D]">
          Best places to send your points.
        </h1>
        <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-[#5B616E]">
          Select a card to compare direct redemption with eligible airline and hotel transfers.
        </p>

        <div className="mt-8">
          {cards.length === 0 ? (
            <p className="text-[#5B616E]">
              You haven&apos;t added any cards yet.{" "}
              <a className="font-semibold text-[#16A34A]" href="/onboarding?edit=1">
                Add cards
              </a>{" "}
              to see transfer recommendations.
            </p>
          ) : !selected ? (
            <p className="text-[#5B616E]">Press the card you want to know about.</p>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold text-[#0A0B0D]">{selected.card.cardName}</h2>
                {selected.status === "ranked" ? (
                  <span className="text-sm text-[#5B616E]">
                    {pointFormatter.format(selected.result.points)} points
                  </span>
                ) : null}
              </div>

              {selected.status === "no-balance" ? (
                <p className="mt-2 text-sm text-[#9AA0AA]">
                  No points balance entered for this card yet.{" "}
                  <a className="font-semibold text-[#16A34A]" href="/onboarding?edit=1">
                    Add a balance
                  </a>
                  .
                </p>
              ) : null}

              {selected.status === "cashback" ? (
                <p className="mt-2 text-sm text-[#9AA0AA]">
                  Cash back is always worth 1¢ per point — there&apos;s nothing to transfer.
                </p>
              ) : null}

              {selected.status === "unsupported" ? (
                <p className="mt-2 text-sm text-[#9AA0AA]">
                  Transfer valuations for this card&apos;s currency aren&apos;t available yet.
                </p>
              ) : null}

              {selected.status === "ranked" ? (
                <>
                  <p className="mt-2 max-w-2xl text-sm text-[#5B616E]">{selected.result.recommendation}</p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {selected.result.topOptions.map((option, index) => (
                      <RedemptionOptionCard key={option.id} option={option} rank={index + 1} />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section aria-label="Your cards">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 className="text-[17px] font-semibold text-[#0A0B0D]">Your cards</h2>
          <span className="text-[13px] text-[#5B616E]">{cards.length} cards</span>
        </div>
        <WalletStack
          cards={cards}
          ranks={new Map()}
          onSelectChange={(key) => {
            if (key) setSelectedKey(key);
          }}
        />
      </section>
    </div>
  );
}
