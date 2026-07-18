import Link from "next/link";
import { cards } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { WalletApp } from "@/components/WalletApp";

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

export default async function WalletPage() {
  const viewerCards = await cardsForViewer();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader
        right={
          <Link
            className="rounded-full bg-[#F5F6F8] px-3.5 py-1.5 text-[13px] font-medium text-[#5B616E] hover:bg-[#EEF0F3]"
            href="/dashboard"
          >
            Dashboard
          </Link>
        }
      />
      <main className="pt-10">
        <WalletApp cards={viewerCards} />
      </main>
    </div>
  );
}
