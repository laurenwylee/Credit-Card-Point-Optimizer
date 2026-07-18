"use client";

import { useState, type FormEvent } from "react";

import type {
  PointValuation,
  PointsApiError,
  PointsCalculationResponse,
} from "@/lib/points/types";
import { SiteHeader } from "@/components/SiteHeader";
import { RedemptionOptionCard } from "@/components/RedemptionOptionCard";

type PointsOptimizerProps = {
  programs: readonly PointValuation[];
  initialResult: PointsCalculationResponse;
};

const dollarFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const pointFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export default function PointsOptimizer({
  programs,
  initialResult,
}: PointsOptimizerProps) {
  const [programId, setProgramId] = useState(initialResult.programId);
  const [pointsInput, setPointsInput] = useState(
    initialResult.points.toString(),
  );
  const [result, setResult] =
    useState<PointsCalculationResponse>(initialResult);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const points = Number(pointsInput);
    if (!Number.isSafeInteger(points) || points <= 0) {
      setError("Enter a positive whole-number balance.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, points }),
      });
      const payload = (await response.json()) as
        | PointsCalculationResponse
        | PointsApiError;

      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload ? payload.error : "Unable to calculate values.",
        );
      }

      setResult(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to calculate values.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const bankPrograms = programs.filter((program) => program.kind === "bank");
  const airlinePrograms = programs.filter(
    (program) => program.kind === "airline",
  );
  const hotelPrograms = programs.filter((program) => program.kind === "hotel");

  return (
    <div className="min-h-screen bg-white text-[#0A0B0D]">
      <SiteHeader
        right={
          <span className="rounded-full bg-[#F5F6F8] px-3.5 py-1.5 text-[13px] font-medium text-[#5B616E]">
            Local data mode
          </span>
        }
      />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#16A34A]">
            Redemption optimizer
          </p>
          <h1 className="mt-4 text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#0A0B0D] sm:text-6xl">
            Find the strongest use for your points.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5B616E]">
            Compare direct value with eligible airline and hotel transfers.
            Close estimates are flagged so a tiny decimal difference does not
            make the decision for you.
          </p>
        </div>

        <section className="mt-10 rounded-3xl border border-[#EEF0F3] bg-white p-6 shadow-sm sm:p-8">
          <form
            className="grid gap-5 md:grid-cols-[1.5fr_1fr_auto] md:items-end"
            onSubmit={handleSubmit}
          >
            <label className="grid gap-2 text-sm font-semibold text-[#5B616E]">
              Rewards program
              <select
                className="h-12 rounded-xl border border-[#D0D5DD] bg-white px-4 text-base text-[#0A0B0D] outline-none transition focus:border-[#16A34A] focus:ring-4 focus:ring-[#DCFCE7]"
                onChange={(event) => setProgramId(event.target.value)}
                value={programId}
              >
                <optgroup label="Bank currencies">
                  {bankPrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Airline programs">
                  {airlinePrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Hotel programs">
                  {hotelPrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#5B616E]">
              Points balance
              <input
                className="h-12 rounded-xl border border-[#D0D5DD] px-4 text-base text-[#0A0B0D] outline-none transition focus:border-[#16A34A] focus:ring-4 focus:ring-[#DCFCE7]"
                inputMode="numeric"
                min="1"
                onChange={(event) => setPointsInput(event.target.value)}
                required
                step="1"
                type="number"
                value={pointsInput}
              />
            </label>

            <button
              className="h-12 rounded-full bg-[#16A34A] px-6 font-semibold text-white transition disabled:cursor-wait disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Comparing…" : "Compare options"}
            </button>
          </form>
          {error ? (
            <p
              className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </section>

        <section aria-live="polite" className="mt-10">
          <div className="grid gap-4 rounded-3xl bg-[#0A0B0D] p-6 text-white sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#86EFAC]">
                Baseline estimate
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {pointFormatter.format(result.points)}{" "}
                {result.programName} points
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-[#9AA0AA]">
                {result.recommendation}
              </p>
            </div>
            <p className="text-4xl font-semibold tracking-[-0.01em] text-white">
              {dollarFormatter.format(result.baselineValueUsd)}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5B616E]">
                Ranked results
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#0A0B0D]">
                {result.topOptions.length > 1
                  ? "Your top three options"
                  : "Your direct-use estimate"}
              </h2>
            </div>
            <p className="text-sm text-[#5B616E]">
              Valuation reviewed {result.valuationUpdatedAt}
            </p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {result.topOptions.map((option, index) => (
              <RedemptionOptionCard key={option.id} option={option} rank={index + 1} />
            ))}
          </div>

          {!result.transferable ? (
            <div className="mt-6 rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] p-5 text-sm leading-6 text-[#0A0B0D]">
              This airline or hotel balance is treated as non-transferable.
              Check the real award or room price before redeeming; this MVP does
              not invent outbound transfer options for loyalty-program points.
            </div>
          ) : null}

          <div className="mt-8 border-t border-[#EEF0F3] pt-6 text-sm leading-6 text-[#5B616E]">
            <p>{result.disclaimer}</p>
            <p className="mt-2">
              Transfer data:{" "}
              {result.transferDataSource === "supabase"
                ? "team Supabase tables"
                : result.transferDataSource === "local-fallback"
                  ? "manually maintained local snapshot"
                  : "not applicable"}
              .
            </p>
          </div>
        </section>

        <section className="mt-14 border-t border-[#EEF0F3] pt-8">
          <h2 className="text-lg font-semibold text-[#0A0B0D]">
            Data transparency
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5B616E]">
            Every valuation in this demo is an editable local estimate with a
            source and review date. No browser-side scraping or live third-party
            dependency is required.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {programs.map((program) => (
              <a
                className="rounded-full border border-[#EEF0F3] bg-white px-3 py-1.5 text-xs font-medium text-[#5B616E] transition hover:border-[#16A34A] hover:text-[#16A34A]"
                href={program.sourceUrl}
                key={program.id}
                rel="noreferrer"
                target="_blank"
              >
                {program.name}: {program.cpp.toFixed(2)}¢
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
