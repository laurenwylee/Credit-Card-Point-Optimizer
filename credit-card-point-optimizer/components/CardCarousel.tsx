"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import type { Card } from "@/lib/cards";
import { CardFace } from "@/components/CardFace";
import { verticalLoop } from "@/lib/verticalLoop";

gsap.registerPlugin(Draggable, InertiaPlugin);

const FADE_MASK =
  "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)";

export function CardCarousel({ cards }: { cards: Card[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const boxes = gsap.utils.toArray<HTMLElement>(".carousel-card", wrapper);
    const loop = verticalLoop(boxes, {
      repeat: -1,
      speed: 0.55,
      draggable: true,
      paused: false,
    });
    if (!loop) return;
    const pause = () => loop.pause();
    const play = () => loop.play();
    wrapper.addEventListener("mouseenter", pause);
    wrapper.addEventListener("mouseleave", play);
    return () => {
      wrapper.removeEventListener("mouseenter", pause);
      wrapper.removeEventListener("mouseleave", play);
      loop.kill();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className="relative h-[600px] cursor-grab overflow-hidden active:cursor-grabbing"
      style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
    >
      {cards.map((card) => (
        <div className="carousel-card w-full py-2.5" key={card.cardKey}>
          <CardFace card={card} />
        </div>
      ))}
    </div>
  );
}
