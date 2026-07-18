import { redirect } from "next/navigation";
import { cards } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { WalletApp } from "@/components/WalletApp";

export default async function WalletPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profile;
  try {
    profile = await loadOnboardingProfile(supabase, user.id);
  } catch {
    redirect("/onboarding");
  }
  if (!profile.completed) redirect("/onboarding");

  const userCards = cards.filter((card) => profile.cardKeys.includes(card.cardKey));

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader
        right={
          <span className="rounded-full bg-[#F5F6F8] px-3.5 py-1.5 text-[13px] font-medium text-[#5B616E]">
            Ramp Hackathon 2026
          </span>
        }
      />
      <main className="pt-10">
        <WalletApp cards={userCards} />
      </main>
    </div>
  );
}
