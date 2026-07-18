import Link from "next/link";
import { cards } from "@/lib/cards";
import { WalletApp } from "@/components/WalletApp";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";

// Signed-in users with completed onboarding see their own wallet; everyone
// else (signed out, no profile, Supabase down) sees the full demo card set.
async function cardsForViewer() {
  const supabase = await createClient();
  if (!supabase) return cards;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return cards;
  try {
    const profile = await loadOnboardingProfile(supabase, user.id);
    if (!profile.completed) return cards;
    const owned = new Set(profile.cardKeys);
    const filtered = cards.filter((card) => owned.has(card.cardKey));
    return filtered.length > 0 ? filtered : cards;
  } catch {
    return cards;
  }
}

export default async function PurchasesPage() {
  const viewerCards = await cardsForViewer();
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-[19px] font-bold tracking-[-0.01em] text-[#0A0B0D]">
          Card<span className="text-[#0052FF]">wise</span>
        </span>
        <Link
          href="/dashboard"
          className="rounded-full bg-[#F5F6F8] px-3.5 py-1.5 text-[13px] font-medium text-[#5B616E] hover:bg-[#EEF0F3]"
        >
          Dashboard
        </Link>
      </header>
      <main className="pt-10">
        <WalletApp cards={viewerCards} />
      </main>
    </div>
  );
}
