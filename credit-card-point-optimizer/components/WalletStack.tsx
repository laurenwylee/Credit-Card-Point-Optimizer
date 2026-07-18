"use client";

import { useEffect, useRef, useState } from "react";
import type { Card } from "@/lib/cards";
import { CardFace } from "@/components/CardFace";

const ASPECT = 1.586; // matches CardFace's aspect-[1.586/1]
const MAX_CARD_WIDTH = 356;
const PEEK_RATIO = 58 / 224; // visible strip of each stacked card, like Apple Wallet
const DETAIL_SPACE = 396; // room reserved below the selected card for its detail panel
const EASE = "cubic-bezier(0.32, 0.72, 0.28, 1)";

function EarningRates({ card }: { card: Card }) {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold text-[#0A0B0D]">Earning rates</h3>
        <span className="text-[13px] text-[#5B616E]">
          {card.annualFee === 0 ? "No annual fee" : `$${card.annualFee} annual fee`}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {card.spendBonusCategory.length === 0 && (
          <li className="text-[14px] text-[#0A0B0D]">
            <span className="font-semibold">{card.baseSpendAmount}%</span> flat rate on everything
          </li>
        )}
        {card.spendBonusCategory.map((b) => (
          <li key={b.spendBonusCategoryName} className="flex gap-2.5 text-[14px] leading-snug">
            <span className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />
            <span className="text-[#0A0B0D]">{b.spendBonusDesc}</span>
          </li>
        ))}
        {card.spendBonusCategory.length > 0 && (
          <li className="flex gap-2.5 text-[14px] leading-snug">
            <span className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-[#D0D5DD]" />
            <span className="text-[#5B616E]">{card.baseSpendAmount}x on everything else</span>
          </li>
        )}
      </ul>
      {card.signupBonusDesc && (
        <p className="mt-4 border-t border-[#EEF0F3] pt-3 text-[13px] leading-snug text-[#5B616E]">
          Welcome offer: {card.signupBonusDesc}
        </p>
      )}
    </>
  );
}

interface WalletStackProps {
  cards: Card[];
  // cardKey -> rank (1-based) for the active category; ranked cards get a badge
  ranks: Map<string, number>;
  // notified whenever the selected card changes (including deselect -> null)
  onSelectChange?: (key: string | null) => void;
}

export function WalletStack({ cards, ranks, onSelectChange }: WalletStackProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(MAX_CARD_WIDTH);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Card size follows the actual rendered width (phones shrink well below
  // MAX_CARD_WIDTH), so the fan/peek math below stays correct at any size
  // instead of assuming a fixed desktop card height.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setCardWidth(Math.min(MAX_CARD_WIDTH, entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function select(key: string | null) {
    setSelectedKey(key);
    onSelectChange?.(key);
  }

  const selectedIndex = cards.findIndex((c) => c.cardKey === selectedKey);
  const selected = selectedIndex >= 0 ? cards[selectedIndex] : null;

  const cardHeight = cardWidth / ASPECT;
  const peek = cardHeight * PEEK_RATIO;
  const selectedHeight = cardHeight + DETAIL_SPACE;
  const collapsedHeight = peek * (cards.length - 1) + cardHeight + 24;
  const containerHeight = selected ? selectedHeight : collapsedHeight;
  const fanBase = selectedHeight - cardHeight + 118; // where collapsed cards peek from the bottom

  return (
    <div
      className={`relative rounded-3xl bg-[#F5F6F8] p-6 ${selected ? "overflow-hidden" : "overflow-y-auto"}`}
      style={{ height: selected ? selectedHeight : 620 }}
      onClick={() => select(null)}
    >
      <div ref={measureRef} className="relative mx-auto w-full max-w-[356px]" style={{ height: containerHeight }}>
        {cards.map((card, i) => {
          const rank = ranks.get(card.cardKey);
          const isSelected = card.cardKey === selectedKey;

          let transform: string;
          let zIndex: number;
          if (!selected) {
            transform = `translateY(${i * peek}px)`;
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
                select(isSelected ? null : card.cardKey);
              }}
            >
              <div className={`transition-transform duration-200 ${!selected ? "group-hover:-translate-y-1.5" : ""}`}>
                <CardFace card={card} />
                {rank !== undefined && !selected && (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#16A34A] px-1.5 text-[12px] font-bold text-white shadow-md ring-2 ring-white">
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
            style={{ top: cardHeight + 16, zIndex: 55 }}
            onClick={(e) => e.stopPropagation()}
          >
            <EarningRates card={selected} />
          </div>
        )}
      </div>
    </div>
  );
}
