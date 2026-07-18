import { redirect } from "next/navigation";
import { cards } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profile;
  try { profile = await loadOnboardingProfile(supabase, user.id); }
  catch { throw new Error("Onboarding tables are unavailable. Apply the latest Supabase migration."); }
  const { edit } = await searchParams;
  if (profile.completed && edit !== "1") redirect("/dashboard");

  return <OnboardingWizard catalog={cards} initialProfile={profile} />;
}
