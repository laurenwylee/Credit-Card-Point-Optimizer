import { getLocalTransferPartners } from "./transfer-partners";
import type {
  PointsCalculationRequest,
  PointsCalculationResponse,
  RankedRedemptionOption,
} from "./types";
import { getPointValuation } from "./valuations";

const DISCLAIMER =
  "Point values are estimates, not guaranteed cash values. Award availability, transfer times, taxes, fees, and the redemption price can change the value you actually receive.";

function isCloseCall(
  option: RankedRedemptionOption,
  options: readonly RankedRedemptionOption[],
): boolean {
  return options.some((candidate) => {
    if (candidate.id === option.id) {
      return false;
    }

    const higherValue = Math.max(
      candidate.estimatedValueUsd,
      option.estimatedValueUsd,
    );

    return (
      higherValue > 0 &&
      Math.abs(candidate.estimatedValueUsd - option.estimatedValueUsd) /
        higherValue <=
        0.05
    );
  });
}

export function optimizePoints({
  programId,
  points,
}: PointsCalculationRequest): PointsCalculationResponse {
  const program = getPointValuation(programId);

  if (!program) {
    throw new Error("Unknown rewards program.");
  }

  if (!Number.isFinite(points) || points <= 0 || !Number.isInteger(points)) {
    throw new Error("Points must be a positive whole number.");
  }

  const baselineValueUsd = (points * program.cpp) / 100;
  const directOption: RankedRedemptionOption = {
    id: `direct:${program.id}`,
    name: `Use as ${program.name}`,
    type: "direct",
    transferRatio: 1,
    bonusPercent: 0,
    destinationPoints: points,
    cpp: program.cpp,
    estimatedValueUsd: baselineValueUsd,
    closeCall: false,
  };

  const transferOptions: RankedRedemptionOption[] = program.transferable
    ? getLocalTransferPartners(program.id).flatMap((transfer) => {
        const destination = getPointValuation(transfer.destinationProgramId);

        if (!destination) {
          return [];
        }

        const destinationPoints =
          points *
          transfer.transferRatio *
          (1 + transfer.bonusPercent / 100);

        return [
          {
            id: `transfer:${program.id}:${destination.id}`,
            name: `Transfer to ${destination.name}`,
            type: "transfer" as const,
            destinationProgramId: destination.id,
            transferRatio: transfer.transferRatio,
            bonusPercent: transfer.bonusPercent,
            destinationPoints,
            cpp: destination.cpp,
            estimatedValueUsd: (destinationPoints * destination.cpp) / 100,
            closeCall: false,
          },
        ];
      })
    : [];

  const rankedOptions = [directOption, ...transferOptions]
    .sort((a, b) => b.estimatedValueUsd - a.estimatedValueUsd)
    .slice(0, 3);

  const topOptions = rankedOptions.map((option) => ({
    ...option,
    closeCall: isCloseCall(option, rankedOptions),
  }));

  const bestOption = topOptions[0];
  const recommendation = program.transferable
    ? `${bestOption.name} has the highest estimated value at $${bestOption.estimatedValueUsd.toFixed(2)}. Compare real award availability and fees before transferring; transfers are usually irreversible.`
    : `${program.name} points are generally non-transferable. Their estimated direct-use value is $${baselineValueUsd.toFixed(2)}; compare that estimate with the specific redemption you are considering.`;

  return {
    programId: program.id,
    programName: program.name,
    programKind: program.kind,
    transferable: program.transferable,
    points,
    baselineValueUsd,
    topOptions,
    recommendation,
    valuationUpdatedAt: program.updatedAt,
    transferDataSource: program.transferable
      ? "local-fallback"
      : "not-applicable",
    disclaimer: DISCLAIMER,
  };
}
