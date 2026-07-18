"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Card, SpendCategory } from "@/lib/cards";
import { SPEND_CATEGORIES } from "@/lib/cards";
import {
  CHOICE_CARD_KEY,
  CHOICE_CATEGORIES,
  ROTATING_CARD_KEYS,
  type CardConfig,
  type OnboardingInput,
  type OnboardingProfile,
} from "@/lib/onboarding";

const CATEGORY_LABELS: Record<SpendCategory, string> = {
  dining: "Dining",
  groceries: "Groceries",
  gas: "Gas & EV charging",
  travel: "General travel",
  flights: "Flights",
  hotels: "Hotels",
  streaming: "Streaming",
  transit: "Transit & rideshare",
  drugstores: "Drugstores",
  entertainment: "Entertainment",
  "online-shopping": "Online shopping",
  "phone-plans": "Phone plans",
  other: "Everything else",
};

const CURRENCY_LABELS: Record<string, string> = {
  "membership-rewards": "Membership Rewards",
  "ultimate-rewards": "Ultimate Rewards",
  "capital-one-miles": "Capital One Miles",
  "wells-fargo-rewards": "Wells Fargo Rewards",
  "us-bank-points": "US Bank points",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
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
  const [configs, setConfigs] = useState<Record<string, CardConfig>>(initialProfile.cardConfigs);
  const [balances, setBalances] = useState<Record<string, number>>(initialProfile.rewardBalances);
  const [spending, setSpending] = useState(initialProfile.monthlySpend);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const issuers = useMemo(
    () => [...new Set(catalog.map((card) => card.cardIssuer))].sort(),
    [catalog],
  );
  const selectedCards = catalog.filter((card) => selected.includes(card.cardKey));
  const rewardCurrencies = [...new Set(
    selectedCards.map((card) => card.earnCurrency).filter((currency) => currency !== "cashback"),
  )];
  const filteredCards = catalog.filter((card) => {
    const query = search.trim().toLowerCase();
    return (
      (issuer === "all" || card.cardIssuer === issuer) &&
      (!query || `${card.cardName} ${card.cardIssuer}`.toLowerCase().includes(query))
    );
  });
  const monthlyTotal = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
  const citiTopCategory = SPEND_CATEGORIES.filter((category) => category !== "other")
    .sort((a, b) => spending[b] - spending[a])[0];

  function toggleCard(key: string) {
    setSelected((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
    setError("");
  }

  function advance() {
    if (step === 1 && selected.length === 0) {
      setError("Select at least one card to continue.");
      return;
    }
    if (step === 2) {
      const missingRotation = ROTATING_CARD_KEYS.some(
        (key) => selected.includes(key) && typeof configs[key]?.bonusActivated !== "boolean",
      );
      if (missingRotation) {
        setError("Confirm whether each rotating rewards category is activated.");
        return;
      }
      if (selected.includes(CHOICE_CARD_KEY) && !configs[CHOICE_CARD_KEY]?.choiceCategory) {
        setError("Choose your Bank of America bonus category.");
        return;
      }
    }
    setError("");
    setStep((current) => Math.min(3, current + 1));
  }

  async function save() {
    if (monthlyTotal <= 0) {
      setError("Enter monthly spending for at least one category.");
      return;
    }
    const selectedCurrencies = new Set(selectedCards.map((card) => card.earnCurrency));
    const payload: OnboardingInput = {
      cardKeys: selected,
      cardConfigs: Object.fromEntries(
        Object.entries(configs).filter(([key]) => selected.includes(key)),
      ),
      rewardBalances: Object.fromEntries(
        Object.entries(balances).filter(([currency]) => selectedCurrencies.has(currency)),
      ),
      monthlySpend: spending,
    };
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save your profile.");
      router.push("/dashboard");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save your profile.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link className="font-semibold tracking-tight" href="/">Cardwise</Link>
          <span className="text-sm text-slate-500">Your financial credentials stay private.</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Set up your profile</p>
            <ol className="mt-6 space-y-4">
              {["Your cards", "Rewards", "Monthly spending"].map((label, index) => (
                <li className={`flex items-center gap-3 text-sm font-semibold ${step === index + 1 ? "text-slate-950" : "text-slate-400"}`} key={label}>
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${step === index + 1 ? "bg-emerald-700 text-white" : step > index + 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200"}`}>{index + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {step === 1 && <>
              <h1 className="text-3xl font-semibold tracking-tight">Which cards are in your wallet?</h1>
              <p className="mt-3 text-slate-600">Choose card products only. Never enter card numbers, passwords, expiration dates, or CVVs.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]">
                <input aria-label="Search cards" className="h-11 rounded-xl border border-slate-300 px-4" onChange={(event) => setSearch(event.target.value)} placeholder="Search cards or issuers" value={search} />
                <select aria-label="Filter by issuer" className="h-11 rounded-xl border border-slate-300 bg-white px-4" onChange={(event) => setIssuer(event.target.value)} value={issuer}><option value="all">All issuers</option>{issuers.map((name) => <option key={name}>{name}</option>)}</select>
              </div>
              <div className="mt-6 grid max-h-[560px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredCards.map((card) => {
                  const checked = selected.includes(card.cardKey);
                  return <button aria-pressed={checked} className={`rounded-2xl border p-4 text-left transition ${checked ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-slate-400"}`} key={card.cardKey} onClick={() => toggleCard(card.cardKey)} type="button"><div className="flex justify-between gap-3"><div><p className="font-semibold">{card.cardName}</p><p className="mt-1 text-sm text-slate-500">{card.cardIssuer} · {card.cardNetwork}</p></div><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-sm ${checked ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300"}`}>{checked ? "✓" : ""}</span></div><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-2.5 py-1">{card.baseSpendAmount}x base</span><span className="rounded-full bg-slate-100 px-2.5 py-1">{card.annualFee ? `${formatCurrency(card.annualFee)}/yr` : "No annual fee"}</span>{card.spendBonusCategory.slice(0, 2).map((bonus) => <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900" key={bonus.spendBonusCategoryName}>{bonus.earnMultiplier}x {bonus.spendBonusCategoryName.replaceAll("-", " ")}</span>)}</div></button>;
                })}
              </div>
              <p className="mt-5 text-sm text-slate-500">Card not listed? More cards are coming soon.</p>
            </>}

            {step === 2 && <>
              <h1 className="text-3xl font-semibold tracking-tight">Add your rewards snapshot</h1>
              <p className="mt-3 text-slate-600">Balances are optional and shared reward programs appear only once.</p>
              {rewardCurrencies.length > 0 ? <div className="mt-7 grid gap-4 sm:grid-cols-2">{rewardCurrencies.map((currency) => <label className="grid gap-2 text-sm font-semibold" key={currency}>{CURRENCY_LABELS[currency] ?? currency.replaceAll("-", " ")} balance<input className="h-12 rounded-xl border border-slate-300 px-4 text-base" inputMode="numeric" min="0" onChange={(event) => setBalances((current) => ({ ...current, [currency]: event.target.value ? Number(event.target.value) : 0 }))} placeholder="0" step="1" type="number" value={balances[currency] || ""} /></label>)}</div> : <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Your selected cards earn cash back, so no points balance is needed.</p>}
              {selectedCards.some((card) => ROTATING_CARD_KEYS.includes(card.cardKey as (typeof ROTATING_CARD_KEYS)[number]) || card.cardKey === CHOICE_CARD_KEY || card.cardKey === "citi-custom-cash") && <div className="mt-8 border-t border-slate-200 pt-7"><h2 className="text-xl font-semibold">Card-specific settings</h2><div className="mt-4 space-y-5">{selectedCards.filter((card) => ROTATING_CARD_KEYS.includes(card.cardKey as (typeof ROTATING_CARD_KEYS)[number])).map((card) => <fieldset className="rounded-2xl border border-slate-200 p-4" key={card.cardKey}><legend className="px-1 font-semibold">{card.cardName}</legend><p className="mb-3 text-sm text-slate-500">Have you activated this quarter&apos;s rotating bonus?</p><div className="flex gap-5">{[true, false].map((value) => <label className="flex items-center gap-2 text-sm" key={String(value)}><input checked={configs[card.cardKey]?.bonusActivated === value} name={`${card.cardKey}-activation`} onChange={() => setConfigs((current) => ({ ...current, [card.cardKey]: { ...current[card.cardKey], bonusActivated: value } }))} type="radio" />{value ? "Activated" : "Not activated"}</label>)}</div></fieldset>)}{selected.includes(CHOICE_CARD_KEY) && <label className="grid gap-2 rounded-2xl border border-slate-200 p-4 font-semibold">Bank of America choice category<select className="h-11 rounded-xl border border-slate-300 bg-white px-4 font-normal" onChange={(event) => setConfigs((current) => ({ ...current, [CHOICE_CARD_KEY]: { ...current[CHOICE_CARD_KEY], choiceCategory: event.target.value as SpendCategory } }))} value={configs[CHOICE_CARD_KEY]?.choiceCategory ?? ""}><option disabled value="">Choose a category</option>{CHOICE_CATEGORIES.map((category) => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}</select></label>}{selected.includes("citi-custom-cash") && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">Citi Custom Cash will use your highest eligible monthly spending category automatically.</div>}</div></div>}
            </>}

            {step === 3 && <>
              <h1 className="text-3xl font-semibold tracking-tight">Estimate a typical month</h1>
              <p className="mt-3 text-slate-600">Approximate amounts are enough. This helps compare which selected card performs best by category.</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">{SPEND_CATEGORIES.map((category) => <label className="grid gap-2 text-sm font-semibold" key={category}>{CATEGORY_LABELS[category]}<div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-emerald-600"><span className="text-slate-400">$</span><input className="min-w-0 flex-1 px-2 outline-none" inputMode="decimal" min="0" onChange={(event) => setSpending((current) => ({ ...current, [category]: event.target.value ? Number(event.target.value) : 0 }))} step="0.01" type="number" value={spending[category] || ""} /></div></label>)}</div>
              <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Review</p><p className="mt-2 font-semibold">{selectedCards.length} card{selectedCards.length === 1 ? "" : "s"} · {rewardCurrencies.length} rewards program{rewardCurrencies.length === 1 ? "" : "s"}</p></div><p className="text-2xl font-semibold">{formatCurrency(monthlyTotal)}<span className="text-sm font-normal text-slate-400"> / month</span></p></div>{selected.includes("citi-custom-cash") && monthlyTotal > 0 && <p className="mt-4 text-sm text-slate-300">Citi Custom Cash top category: {CATEGORY_LABELS[citiTopCategory]}</p>}</div>
            </>}

            {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{error}</p>}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6"><button className="rounded-xl px-4 py-2 font-semibold text-slate-600 disabled:invisible" disabled={step === 1} onClick={() => { setError(""); setStep((current) => current - 1); }} type="button">Back</button>{step < 3 ? <button className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-emerald-700" onClick={advance} type="button">Continue</button> : <button className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white disabled:opacity-60" disabled={saving} onClick={save} type="button">{saving ? "Saving…" : "Save profile"}</button>}</div>
          </section>
        </div>
      </main>
    </div>
  );
}
