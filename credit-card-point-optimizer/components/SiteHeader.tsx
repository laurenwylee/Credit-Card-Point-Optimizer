import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b border-[#EEF0F3] bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-4 sm:px-6 sm:py-6">
        <Link className="text-[19px] font-bold tracking-[-0.01em] text-[#0A0B0D]" href="/">
          Point<span className="text-[#16A34A]">maxxer</span>
        </Link>
        {right}
      </div>
    </header>
  );
}
