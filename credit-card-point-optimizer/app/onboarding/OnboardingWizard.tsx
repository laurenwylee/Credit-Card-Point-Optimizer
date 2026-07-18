"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Card } from "@/lib/cards";
import type { OnboardingInput, OnboardingProfile } from "@/lib/onboarding";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatPoints(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function OnboardingWizard({
  catalog,
  initialProfile,
}: {
  catalog: Card[];
  initialProfile: OnboardingProfile;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [issuer, setIssuer] = useState("all");
  const [selected, setSelected] = useState<string[]>(initialProfile.cardKeys);
  const [pointBalances, setPointBalances] = useState<Record<string, number>>(
    initialProfile.cardPointBalances,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const issuers = useMemo(
    () => [...new Set(catalog.map((card) => card.cardIssuer))].sort(),
    [catalog],
  );
  const selectedCards = catalog.filter((card) => selected.includes(card.cardKey));
  const filteredCards = catalog.filter((card) => {
    const query = search.trim().toLowerCase();
    return (
      (issuer === "all" || card.cardIssuer === issuer) &&
      (!query || `${card.cardName} ${card.cardIssuer}`.toLowerCase().includes(query))
    );
  });
  const totalPoints = selected.reduce((sum, cardKey) => sum + (pointBalances[cardKey] ?? 0), 0);

  function toggleCard(key: string) {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
    setError("");
  }

  function continueToBalances() {
    if (selected.length === 0) {
      setError("Select at least one card to continue.");
      return;
    }
    setError("");
    setStep(2);
  }

  async function save() {
    const payload: OnboardingInput = {
      cardKeys: selected,
      cardPointBalances: Object.fromEntries(
        selected.map((cardKey) => [cardKey, pointBalances[cardKey] ?? 0]),
      ),
    };
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save your cards.");
      router.push("/dashboard");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save your cards.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link className="font-semibold tracking-tight" href="/">Cardwise</Link>
          <span className="text-sm text-slate-500">Never enter card numbers or login credentials.</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Set up your wallet</p>
            <ol className="mt-6 space-y-4">
              {["Your cards", "Points balances"].map((label, index) => (
                <li className={`flex items-center gap-3 text-sm font-semibold ${step === index + 1 ? "text-slate-950" : "text-slate-400"}`} key={label}>
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${step === index + 1 ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-800"}`}>{index + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {step === 1 && <>
              <h1 className="text-3xl font-semibold tracking-tight">Which cards do you have?</h1>
              <p className="mt-3 text-slate-600">Select the card products in your wallet. Do not enter card numbers, passwords, expiration dates, or CVVs.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]">
                <input aria-label="Search cards" className="h-11 rounded-xl border border-slate-300 px-4" onChange={(event) => setSearch(event.target.value)} placeholder="Search cards or issuers" value={search} />
                <select aria-label="Filter by issuer" className="h-11 rounded-xl border border-slate-300 bg-white px-4" onChange={(event) => setIssuer(event.target.value)} value={issuer}><option value="all">All issuers</option>{issuers.map((name) => <option key={name}>{name}</option>)}</select>
              </div>
              <div className="mt-6 grid max-h-[560px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredCards.map((card) => {
                  const checked = selected.includes(card.cardKey);
                  return <button aria-pressed={checked} className={`rounded-2xl border p-4 text-left transition ${checked ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-slate-400"}`} key={card.cardKey} onClick={() => toggleCard(card.cardKey)} type="button"><div className="flex justify-between gap-3"><div><p className="font-semibold">{card.cardName}</p><p className="mt-1 text-sm text-slate-500">{card.cardIssuer} · {card.cardNetwork}</p></div><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-sm ${checked ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300"}`}>{checked ? "✓" : ""}</span></div><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-2.5 py-1">{card.baseSpendAmount}x base</span><span className="rounded-full bg-slate-100 px-2.5 py-1">{card.annualFee ? `${formatCurrency(card.annualFee)}/yr` : "No annual fee"}</span></div></button>;
                })}
              </div>
              <p className="mt-5 text-sm text-slate-500">Card not listed? More cards are coming soon.</p>
            </>}

            {step === 2 && <>
              <h1 className="text-3xl font-semibold tracking-tight">How many points are on each card?</h1>
              <p className="mt-3 text-slate-600">Enter your current balance for each card. If you do not know a balance or the card earns cash back, leave it at zero.</p>
              <div className="mt-7 space-y-4">
                {selectedCards.map((card) => (
                  <label className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_220px] sm:items-center" key={card.cardKey}>
                    <span><span className="block font-semibold">{card.cardName}</span><span className="mt-1 block text-sm text-slate-500">{card.cardIssuer}</span></span>
                    <span className="grid gap-2 text-sm font-semibold">Points balance<input aria-label={`${card.cardName} points balance`} className="h-12 rounded-xl border border-slate-300 px-4 text-base" inputMode="numeric" min="0" onChange={(event) => setPointBalances((current) => ({ ...current, [card.cardKey]: event.target.value ? Number(event.target.value) : 0 }))} placeholder="0" step="1" type="number" value={pointBalances[card.cardKey] || ""} /></span>
                  </label>
                ))}
              </div>
              <div className="mt-7 rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Review</p>
                <p className="mt-2 font-semibold">{selectedCards.length} card{selectedCards.length === 1 ? "" : "s"}</p>
                <p className="mt-1 text-sm text-slate-300">{formatPoints(totalPoints)} total points entered</p>
              </div>
            </>}

            {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{error}</p>}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <button className="rounded-xl px-4 py-2 font-semibold text-slate-600 disabled:invisible" disabled={step === 1} onClick={() => { setError(""); setStep(1); }} type="button">Back</button>
              {step === 1
                ? <button className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-emerald-700" onClick={continueToBalances} type="button">Continue</button>
                : <button className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white disabled:opacity-60" disabled={saving} onClick={save} type="button">{saving ? "Saving…" : "Save cards"}</button>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
