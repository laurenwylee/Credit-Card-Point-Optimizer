import { getPointValuation, type PointValuation } from "@/lib/pointValuations";
import { getTransferPartners, type TransferPartner } from "@/lib/transferPartners";
import { getSweetSpots, type SweetSpot } from "@/lib/sweetSpots";

export type RedemptionOption = {
  type: "direct" | "transfer" | "sweet_spot";
  programName: string;
  currencyCode: string;
  effectiveCentsPerPoint: number;
  estimatedValueUsd: number;
  transferRatio?: number;
  transferBonusPct?: number;
  sweetSpotTitle?: string;
  sweetSpotUnitsAffordable?: number;
};

function buildSweetSpotOptions(
  currencyCode: string,
  programName: string,
  availablePoints: number,
  averageCentsPerPoint: number,
  sweetSpots: SweetSpot[],
  transferFields: Pick<RedemptionOption, "transferRatio" | "transferBonusPct"> = {}
): RedemptionOption[] {
  return sweetSpots
    .filter((spot) => spot.currencyCode === currencyCode)
    .map((spot): RedemptionOption | null => {
      const unitsAffordable = Math.floor(availablePoints / spot.pointsRequired);
      if (unitsAffordable < 1) return null;

      const leftoverPoints = availablePoints - unitsAffordable * spot.pointsRequired;
      const estimatedValueUsd =
        unitsAffordable * spot.typicalCashValueUsd +
        (leftoverPoints * averageCentsPerPoint) / 100;

      return {
        type: "sweet_spot",
        programName,
        currencyCode,
        effectiveCentsPerPoint: (estimatedValueUsd * 100) / availablePoints,
        estimatedValueUsd,
        sweetSpotTitle: `${spot.title} (${unitsAffordable} ${spot.unit}${unitsAffordable === 1 ? "" : "s"})`,
        sweetSpotUnitsAffordable: unitsAffordable,
        ...transferFields,
      };
    })
    .filter((o): o is RedemptionOption => o !== null);
}

export function calculateRedemptionOptions(
  ownValuation: PointValuation,
  transferPartners: TransferPartner[],
  destinationValuations: PointValuation[],
  sweetSpots: SweetSpot[],
  pointsBalance: number
): RedemptionOption[] {
  const options: RedemptionOption[] = [
    {
      type: "direct",
      programName: ownValuation.programName,
      currencyCode: ownValuation.currencyCode,
      effectiveCentsPerPoint: ownValuation.centsPerPoint,
      estimatedValueUsd: (pointsBalance * ownValuation.centsPerPoint) / 100,
    },
    ...buildSweetSpotOptions(
      ownValuation.currencyCode,
      ownValuation.programName,
      pointsBalance,
      ownValuation.centsPerPoint,
      sweetSpots
    ),
  ];

  for (const partner of transferPartners) {
    const destinationValuation = destinationValuations.find(
      (v) => v.currencyCode === partner.toCurrencyCode
    );
    if (!destinationValuation) continue;

    const transferredPoints =
      pointsBalance * partner.ratio * (1 + partner.bonusPct / 100);
    const estimatedValueUsd =
      (transferredPoints * destinationValuation.centsPerPoint) / 100;

    options.push({
      type: "transfer",
      programName: destinationValuation.programName,
      currencyCode: destinationValuation.currencyCode,
      effectiveCentsPerPoint: destinationValuation.centsPerPoint,
      estimatedValueUsd,
      transferRatio: partner.ratio,
      transferBonusPct: partner.bonusPct,
    });

    options.push(
      ...buildSweetSpotOptions(
        destinationValuation.currencyCode,
        destinationValuation.programName,
        transferredPoints,
        destinationValuation.centsPerPoint,
        sweetSpots,
        { transferRatio: partner.ratio, transferBonusPct: partner.bonusPct }
      )
    );
  }

  return options.sort((a, b) => b.estimatedValueUsd - a.estimatedValueUsd);
}

export async function getBestRedemptionOptions(
  currencyCode: string,
  pointsBalance: number
): Promise<RedemptionOption[]> {
  const ownValuation = await getPointValuation(currencyCode);

  if (!ownValuation) {
    throw new Error(`No valuation found for currency "${currencyCode}"`);
  }

  const transferPartners = await getTransferPartners(currencyCode);
  const destinationValuations = await Promise.all(
    transferPartners.map((p) => getPointValuation(p.toCurrencyCode))
  ).then((results) => results.filter((v): v is PointValuation => v !== null));

  const relevantCurrencyCodes = [
    currencyCode,
    ...destinationValuations.map((v) => v.currencyCode),
  ];
  const sweetSpots = await getSweetSpots(relevantCurrencyCodes);

  return calculateRedemptionOptions(
    ownValuation,
    transferPartners,
    destinationValuations,
    sweetSpots,
    pointsBalance
  );
}
