"use client";

import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/cards";
import type { Recommendation } from "@/lib/recommend";
import { RecommendPanel } from "@/components/RecommendPanel";
import { WalletStack } from "@/components/WalletStack";

export function WalletApp({ cards }: { cards: Card[] }) {
  const [category, setCategory] = useState("dining");
  const [amount, setAmount] = useState("100");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    // top=99 so the panel can compare best vs worst for the savings callout
    fetch(`/api/recommend?category=${category}&top=99`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setRecommendations(data.recommendations ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setLoading(false);
      });
    return () => controller.abort();
  }, [category]);

  const ranks = useMemo(() => {
    const m = new Map<string, number>();
    recommendations.slice(0, 3).forEach((rec, i) => m.set(rec.cardKey, i + 1));
    return m;
  }, [recommendations]);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* min-w-0 lets truncated text shrink instead of blowing out the grid column */}
      <section className="min-w-0">
        <h1 className="max-w-xl text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#0A0B0D]">
          The right card for every purchase.
        </h1>
        <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-[#5B616E]">
          Pick what you&apos;re buying and we&apos;ll rank your cards by real value back — points
          valuations included, portal tricks flagged.
        </p>
        <div className="mt-8">
          <RecommendPanel
            category={category}
            onCategoryChange={setCategory}
            amount={amount}
            onAmountChange={setAmount}
            recommendations={recommendations}
            loading={loading}
          />
        </div>
      </section>

      <section aria-label="Your cards">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 className="text-[17px] font-semibold text-[#0A0B0D]">Your cards</h2>
          <span className="text-[13px] text-[#5B616E]">{cards.length} cards</span>
        </div>
        <WalletStack cards={cards} ranks={ranks} />
      </section>
    </div>
  );
}
