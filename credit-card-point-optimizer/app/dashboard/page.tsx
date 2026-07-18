import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { artFor, imageFor } from "@/lib/cardArt";
import { cards } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";

const points = new Intl.NumberFormat("en-US");

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profile;
  try { profile = await loadOnboardingProfile(supabase, user.id); }
  catch { redirect("/onboarding"); }
  if (!profile.completed) redirect("/onboarding");

  const selectedCards = cards.filter((card) => profile.cardKeys.includes(card.cardKey));
  const totalPoints = Object.values(profile.cardPointBalances).reduce(
    (sum, balance) => sum + balance,
    0,
  );

  return <div className="min-h-screen bg-white"><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-14 text-[#0A0B0D]"><div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-bold tracking-[-0.01em]">Your card wallet</h1><p className="mt-3 text-[#5B616E]">Signed in as {user.email ?? "your account"}.</p></div><div className="flex flex-wrap gap-3"><Link className="rounded-full bg-[#16A34A] px-5 py-3 font-semibold text-white" href="/purchases">Find best card</Link><Link className="rounded-full bg-[#16A34A] px-5 py-3 font-semibold text-white" href="/transfers">Transfer points</Link><Link className="rounded-full border border-[#D0D5DD] bg-white px-5 py-3 font-semibold" href="/onboarding?edit=1">Edit cards</Link></div></div><div className="mt-10 grid gap-5 sm:grid-cols-2"><section className="rounded-2xl border border-[#EEF0F3] bg-white p-5"><p className="text-sm text-[#5B616E]">Cards in wallet</p><p className="mt-2 text-3xl font-semibold">{selectedCards.length}</p></section><section className="rounded-2xl border border-[#EEF0F3] bg-white p-5"><p className="text-sm text-[#5B616E]">Total points entered</p><p className="mt-2 text-3xl font-semibold">{points.format(totalPoints)}</p></section></div><section className="mt-7 rounded-2xl border border-[#EEF0F3] bg-white p-6"><h2 className="text-xl font-semibold">Your cards and points</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedCards.map((card) => { const img = imageFor(card.cardKey); return <div className="rounded-xl bg-[#F5F6F8] p-4" key={card.cardKey}><div className="flex items-center gap-3"><span className="relative h-11 w-[70px] shrink-0 overflow-hidden rounded-md shadow-sm" style={{ background: artFor(card.cardKey).background }}>{img && <Image alt="" className="object-cover" fill sizes="70px" src={img.src} style={{ transform: `scale(${img.zoom})` }} />}</span><div className="min-w-0"><p className="truncate font-semibold">{card.cardName}</p><p className="mt-0.5 text-sm text-[#5B616E]">{card.cardIssuer}</p></div></div><p className="mt-3 text-lg font-semibold text-[#16A34A]">{points.format(profile.cardPointBalances[card.cardKey] ?? 0)} points</p></div>; })}</div></section></main></div>;
}
