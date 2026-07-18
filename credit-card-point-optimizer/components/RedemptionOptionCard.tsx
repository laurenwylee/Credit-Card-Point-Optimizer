import type { RankedRedemptionOption } from "@/lib/points/types";

const dollarFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const pointFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function RedemptionOptionCard({
  option,
  rank,
}: {
  option: RankedRedemptionOption;
  rank: number;
}) {
  return (
    <article className="rounded-2xl border border-[#EEF0F3] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA0AA]">
            Option {rank}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#0A0B0D]">
            {option.name}
          </h3>
        </div>
        {option.closeCall ? (
          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            Close call
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-[-0.01em] text-[#0052FF]">
        {dollarFormatter.format(option.estimatedValueUsd)}
      </p>
      <p className="mt-1 text-sm text-[#5B616E]">estimated redemption value</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[#EEF0F3] pt-4 text-sm">
        <div>
          <dt className="text-[#5B616E]">Resulting points</dt>
          <dd className="mt-1 font-semibold text-[#0A0B0D]">
            {pointFormatter.format(option.destinationPoints)}
          </dd>
        </div>
        <div>
          <dt className="text-[#5B616E]">Estimated value</dt>
          <dd className="mt-1 font-semibold text-[#0A0B0D]">
            {option.cpp.toFixed(2)}¢ / point
          </dd>
        </div>
        {option.type === "transfer" ? (
          <>
            <div>
              <dt className="text-[#5B616E]">Transfer ratio</dt>
              <dd className="mt-1 font-semibold text-[#0A0B0D]">
                1 : {option.transferRatio}
              </dd>
            </div>
            <div>
              <dt className="text-[#5B616E]">Transfer bonus</dt>
              <dd className="mt-1 font-semibold text-[#0A0B0D]">
                {option.bonusPercent}%
              </dd>
            </div>
          </>
        ) : null}
      </dl>
    </article>
  );
}
