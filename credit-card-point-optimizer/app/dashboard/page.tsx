import Link from "next/link";
import { redirect } from "next/navigation";
import { cards } from "@/lib/cards";
import { loadOnboardingProfile } from "@/lib/onboarding";
import { createClient } from "@/utils/supabase/server";

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

  return <main className="min-h-screen bg-slate-50 px-6 py-14 text-slate-950"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Cardwise</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Your card wallet</h1><p className="mt-3 text-slate-600">Signed in as {user.email ?? "your account"}.</p></div><Link className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold" href="/onboarding?edit=1">Edit cards</Link></div><div className="mt-10 grid gap-5 sm:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Cards in wallet</p><p className="mt-2 text-3xl font-semibold">{selectedCards.length}</p></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total points entered</p><p className="mt-2 text-3xl font-semibold">{points.format(totalPoints)}</p></section></div><section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">Your cards and points</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedCards.map((card) => <div className="rounded-xl bg-slate-50 p-4" key={card.cardKey}><p className="font-semibold">{card.cardName}</p><p className="mt-1 text-sm text-slate-500">{card.cardIssuer}</p><p className="mt-3 text-lg font-semibold text-emerald-800">{points.format(profile.cardPointBalances[card.cardKey] ?? 0)} points</p></div>)}</div></section></div></main>;
}
