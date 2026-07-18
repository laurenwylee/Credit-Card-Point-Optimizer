import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b border-[#EEF0F3] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link className="text-[19px] font-bold tracking-[-0.01em] text-[#0A0B0D]" href="/">
          Point<span className="text-[#0052FF]">maxxer</span>
        </Link>
        {right}
      </div>
    </header>
  );
}
