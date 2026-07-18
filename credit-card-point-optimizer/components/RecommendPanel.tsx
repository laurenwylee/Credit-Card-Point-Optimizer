"use client";

import type { Recommendation } from "@/lib/recommend";
import { artFor } from "@/lib/cardArt";

export const CATEGORY_LABELS: [string, string][] = [
  ["dining", "Dining"],
  ["groceries", "Groceries"],
  ["gas", "Gas"],
  ["travel", "Travel"],
  ["flights", "Flights"],
  ["hotels", "Hotels"],
  ["streaming", "Streaming"],
  ["transit", "Transit"],
  ["drugstores", "Drugstores"],
  ["entertainment", "Entertainment"],
  ["online-shopping", "Online shopping"],
  ["phone-plans", "Phone plans"],
];

interface RecommendPanelProps {
  category: string;
  onCategoryChange: (c: string) => void;
  amount: string;
  onAmountChange: (a: string) => void;
  recommendations: Recommendation[];
  loading: boolean;
}

export function RecommendPanel({
  category,
  onCategoryChange,
  amount,
  onAmountChange,
  recommendations,
  loading,
}: RecommendPanelProps) {
  const top3 = recommendations.slice(0, 3);
  const parsedAmount = Number.parseFloat(amount);
  const hasAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const best = recommendations[0];
  const worst = recommendations[recommendations.length - 1];
  const deltaCents =
    hasAmount && best && worst ? Math.round((best.centsPerDollar - worst.centsPerDollar) * parsedAmount) : 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_LABELS.map(([slug, label]) => (
          <button
            key={slug}
            type="button"
            onClick={() => onCategoryChange(slug)}
            className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
              category === slug
                ? "bg-[#0052FF] text-white"
                : "bg-white text-[#0A0B0D] ring-1 ring-inset ring-[#D0D5DD] hover:bg-[#F5F6F8]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <label htmlFor="amount" className="text-[14px] font-medium text-[#5B616E]">
          Purchase amount
        </label>
        <div className="flex items-center rounded-lg bg-white ring-1 ring-inset ring-[#D0D5DD] focus-within:ring-2 focus-within:ring-[#0052FF]">
          <span className="pl-3 text-[14px] text-[#5B616E]">$</span>
          <input
            id="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-24 bg-transparent px-2 py-2 text-[14px] font-medium text-[#0A0B0D] outline-none"
            placeholder="100"
          />
        </div>
      </div>

      <ol className={`mt-6 space-y-3 transition-opacity ${loading ? "opacity-50" : ""}`}>
        {top3.map((rec, i) => {
          const art = artFor(rec.cardKey);
          const earned = hasAmount ? (rec.centsPerDollar * parsedAmount) / 100 : null;
          return (
            <li
              key={rec.cardKey}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-inset ring-[#EEF0F3]"
            >
              <span className="w-5 text-center text-[15px] font-bold text-[#9AA0AA]">{i + 1}</span>
              <span
                className="h-9 w-14 shrink-0 rounded-md shadow-sm"
                style={{ background: art.background }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[#0A0B0D]">{rec.cardName}</p>
                <p className="truncate text-[13px] text-[#5B616E]">{rec.rewardDesc}</p>
                {rec.caveats.length > 0 && (
                  <p className="mt-0.5 truncate text-[12px] text-[#9AA0AA]">{rec.caveats.join(" · ")}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold text-[#0A0B0D]">{rec.centsPerDollar}¢/$1</p>
                {earned !== null && (
                  <p className="text-[13px] font-medium text-[#0052FF]">${earned.toFixed(2)} back</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {hasAmount && deltaCents > 0 && best && (
        <p className="mt-4 rounded-xl bg-[#EBF0FF] px-4 py-3 text-[14px] leading-snug text-[#0A0B0D]">
          Paying with the <span className="font-semibold">{best.cardName}</span> instead of your
          lowest-earning card gets you{" "}
          <span className="font-semibold text-[#0052FF]">${(deltaCents / 100).toFixed(2)} more</span> on
          this purchase.
        </p>
      )}
    </div>
  );
}
