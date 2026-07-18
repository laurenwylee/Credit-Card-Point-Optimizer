import Image from "next/image";
import type { Card } from "@/lib/cards";
import { artFor, imageFor } from "@/lib/cardArt";

function NetworkMark({ network, color }: { network: string; color: string }) {
  if (network === "mastercard") {
    return (
      <span className="flex items-center">
        <span className="h-[22px] w-[22px] rounded-full bg-[#EB001B] opacity-90" />
        <span className="-ml-2.5 h-[22px] w-[22px] rounded-full bg-[#F79E1B] opacity-90" />
      </span>
    );
  }
  const label = network === "amex" ? "AMERICAN EXPRESS" : network === "visa" ? "VISA" : "DISCOVER";
  return (
    <span
      className={network === "visa" ? "text-[17px] font-extrabold italic tracking-tight" : "text-[9px] font-bold tracking-[0.14em]"}
      style={{ color }}
    >
      {label}
    </span>
  );
}

export function CardFace({ card }: { card: Card }) {
  const art = artFor(card.cardKey);
  const image = imageFor(card.cardKey);

  if (image) {
    return (
      <div
        className="relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(10,11,13,0.18)]"
        style={{ background: art.background }}
      >
        <Image
          src={image.src}
          alt={card.cardName}
          fill
          sizes="356px"
          className="object-cover"
          style={{ transform: `scale(${image.zoom})` }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className="relative flex aspect-[1.586/1] w-full select-none flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-[0_8px_24px_rgba(10,11,13,0.18)]"
      style={{ background: art.background, color: art.text }}
    >
      {/* soft sheen so the face doesn't read as flat vector fill */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 15% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%)" }}
      />
      {/* card name lives on the top strip so it stays readable in the stacked peek */}
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 truncate text-[14px] font-semibold">{card.cardName}</span>
        <span className="shrink-0 text-[11px] font-medium leading-5" style={{ color: art.subtleText }}>
          {card.annualFee === 0 ? "No annual fee" : `$${card.annualFee}/yr`}
        </span>
      </div>

      {/* chip */}
      <div className="h-[30px] w-[40px] rounded-[6px] border border-black/10 bg-gradient-to-br from-[#E6D294] to-[#C0A860] shadow-inner">
        <div className="mx-auto mt-[9px] h-[10px] w-[26px] rounded-sm border border-black/15" />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold tracking-[0.08em]" style={{ color: art.subtleText }}>
            {card.cardIssuer.toUpperCase()}
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em]" style={{ color: art.subtleText }}>
            •••• 4242
          </p>
        </div>
        <NetworkMark network={art.network} color={art.text} />
      </div>
    </div>
  );
}
