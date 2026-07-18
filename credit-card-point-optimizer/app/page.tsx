import { cards } from "@/lib/cards";
import { WalletApp } from "@/components/WalletApp";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-[19px] font-bold tracking-[-0.01em] text-[#0A0B0D]">
          point<span className="text-[#0052FF]">max</span>
        </span>
        <span className="rounded-full bg-[#F5F6F8] px-3.5 py-1.5 text-[13px] font-medium text-[#5B616E]">
          Ramp Hackathon 2026
        </span>
      </header>
      <main className="pt-10">
        <WalletApp cards={cards} />
      </main>
    </div>
  );
}
