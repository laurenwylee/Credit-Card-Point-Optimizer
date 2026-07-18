"use client";

import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/cards";
import type { Recommendation } from "@/lib/recommend";
import type { SignupNudge } from "@/lib/signupBonus";
import { RecommendPanel } from "@/components/RecommendPanel";
import { WalletStack } from "@/components/WalletStack";

export function WalletApp({ cards, nudge }: { cards: Card[]; nudge?: SignupNudge | null }) {
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
          Pick what you&apos;re buying and we&apos;ll rank your cards by real value back.
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
        {nudge && <SignupNudgeBanner nudge={nudge} amount={amount} />}
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

function SignupNudgeBanner({ nudge, amount }: { nudge: SignupNudge; amount: string }) {
  const parsed = Number.parseFloat(amount);
  const pct = Number.isFinite(parsed) && parsed > 0 ? Math.min(100, (parsed / nudge.spend) * 100) : null;
  const displayName = /^the /i.test(nudge.cardName) ? nudge.cardName : `the ${nudge.cardName}`;
  return (
    <div className="mt-5 rounded-2xl border border-[#EEF0F3] bg-white p-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#0052FF]">
        Welcome offer
      </p>
      <p className="mt-1.5 text-[14px] leading-snug text-[#0A0B0D]">
        Spend <span className="font-semibold">${nudge.spend.toLocaleString()}</span> in your first{" "}
        {nudge.months} months on <span className="font-semibold">{displayName}</span> to earn{" "}
        {nudge.bonusLabel} — worth about{" "}
        <span className="font-semibold">${nudge.valueDollars.toLocaleString()}</span>.
      </p>
      {pct !== null && (
        <p className="mt-1 text-[13px] text-[#5B616E]">
          Routing this ${parsed.toLocaleString()} purchase there covers {pct < 1 ? pct.toFixed(1) : Math.round(pct)}% of
          the spend requirement.
        </p>
      )}
    </div>
  );
}
