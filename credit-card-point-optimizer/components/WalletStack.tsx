"use client";

import { useState } from "react";
import type { Card } from "@/lib/cards";
import { CardFace } from "@/components/CardFace";

const PEEK = 58; // visible strip of each stacked card, like Apple Wallet
const CARD_HEIGHT = 224; // 356px wide at 1.586 aspect
const EASE = "cubic-bezier(0.32, 0.72, 0.28, 1)";

interface WalletStackProps {
  cards: Card[];
  // cardKey -> rank (1-based) for the active category; ranked cards get a badge
  ranks: Map<string, number>;
}

export function WalletStack({ cards, ranks }: WalletStackProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectedIndex = cards.findIndex((c) => c.cardKey === selectedKey);
  const selected = selectedIndex >= 0 ? cards[selectedIndex] : null;

  const containerHeight = selected ? 620 : PEEK * (cards.length - 1) + CARD_HEIGHT + 24;
  const fanBase = 620 - CARD_HEIGHT + 118; // where collapsed cards peek from the bottom

  return (
    <div
      className={`relative h-[620px] rounded-3xl bg-[#F5F6F8] p-6 ${selected ? "overflow-hidden" : "overflow-y-auto"}`}
      onClick={() => setSelectedKey(null)}
    >
      <div className="relative mx-auto w-full max-w-[356px]" style={{ height: containerHeight }}>
        {cards.map((card, i) => {
          const rank = ranks.get(card.cardKey);
          const isSelected = card.cardKey === selectedKey;

          let transform: string;
          let zIndex: number;
          if (!selected) {
            transform = `translateY(${i * PEEK}px)`;
            zIndex = i + 1;
          } else if (isSelected) {
            transform = "translateY(0px)";
            zIndex = 60;
          } else {
            // remaining cards collapse into a fan at the bottom, Wallet-style
            const fanIndex = i - (i > selectedIndex ? 1 : 0);
            transform = `translateY(${fanBase + fanIndex * 9}px) scale(0.94)`;
            zIndex = fanIndex + 1;
          }

          return (
            <button
              key={card.cardKey}
              type="button"
              aria-label={`${card.cardName} details`}
              className="group absolute inset-x-0 top-0 block w-full cursor-pointer text-left focus:outline-none"
              style={{ transform, zIndex, transition: `transform 420ms ${EASE}` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedKey(isSelected ? null : card.cardKey);
              }}
            >
              <div className={`transition-transform duration-200 ${!selected ? "group-hover:-translate-y-1.5" : ""}`}>
                <CardFace card={card} />
                {rank !== undefined && !selected && (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#0052FF] px-1.5 text-[12px] font-bold text-white shadow-md ring-2 ring-white">
                    {rank}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {selected && (
          <div
            className="absolute inset-x-0 rounded-2xl bg-white p-5 shadow-sm"
            style={{ top: CARD_HEIGHT + 16, zIndex: 55 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold text-[#0A0B0D]">Earning rates</h3>
              <span className="text-[13px] text-[#5B616E]">
                {selected.annualFee === 0 ? "No annual fee" : `$${selected.annualFee} annual fee`}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {selected.spendBonusCategory.length === 0 && (
                <li className="text-[14px] text-[#0A0B0D]">
                  <span className="font-semibold">{selected.baseSpendAmount}%</span> flat rate on everything
                </li>
              )}
              {selected.spendBonusCategory.map((b) => (
                <li key={b.spendBonusCategoryName} className="flex gap-2.5 text-[14px] leading-snug">
                  <span className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-[#0052FF]" />
                  <span className="text-[#0A0B0D]">{b.spendBonusDesc}</span>
                </li>
              ))}
              {selected.spendBonusCategory.length > 0 && (
                <li className="flex gap-2.5 text-[14px] leading-snug">
                  <span className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-[#D0D5DD]" />
                  <span className="text-[#5B616E]">{selected.baseSpendAmount}x on everything else</span>
                </li>
              )}
            </ul>
            {selected.signupBonusDesc && (
              <p className="mt-4 border-t border-[#EEF0F3] pt-3 text-[13px] leading-snug text-[#5B616E]">
                Welcome offer: {selected.signupBonusDesc}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
