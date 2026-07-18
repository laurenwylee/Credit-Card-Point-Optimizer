import "server-only";

import { getPointValuations } from "@/lib/pointValuations";
import { getTransferPartners } from "@/lib/transferPartners";

import { optimizePoints } from "./optimizer";
import { LOCAL_TRANSFER_PARTNERS } from "./transfer-partners";
import type {
  PointValuation,
  PointsCalculationRequest,
  PointsCalculationResponse,
  TransferPartner,
} from "./types";
import { POINT_VALUATIONS } from "./valuations";

const DATABASE_TO_LOCAL_ID: Record<string, string> = {
  chase_ur: "chase-ultimate-rewards",
  amex_mr: "amex-membership-rewards",
  citi_typ: "citi-thankyou-points",
  capital_one: "capital-one-miles",
  united_mileageplus: "united-mileageplus",
  delta_skymiles: "delta-skymiles",
  american_aadvantage: "american-aadvantage",
  southwest_rr: "southwest-rapid-rewards",
  marriott_bonvoy: "marriott-bonvoy",
  hilton_honors: "hilton-honors",
  hyatt_world_of_hyatt: "world-of-hyatt",
  ihg_one_rewards: "ihg-one-rewards",
};

const LOCAL_TO_DATABASE_ID = Object.fromEntries(
  Object.entries(DATABASE_TO_LOCAL_ID).map(([databaseId, localId]) => [
    localId,
    databaseId,
  ]),
);

function isActiveBonus(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return true;
  }

  return expiresAt >= new Date().toISOString().slice(0, 10);
}

export async function optimizePointsWithDataSource(
  request: PointsCalculationRequest,
): Promise<PointsCalculationResponse> {
  const sourceDatabaseId = LOCAL_TO_DATABASE_ID[request.programId];

  if (!sourceDatabaseId) {
    return optimizePoints(request);
  }

  try {
    const databaseValuations = await getPointValuations();
    const selectedProgram = POINT_VALUATIONS.find(
      (valuation) => valuation.id === request.programId,
    );

    if (!selectedProgram) {
      return optimizePoints(request);
    }

    const databaseTransfers = selectedProgram.transferable
      ? await getTransferPartners(sourceDatabaseId)
      : [];

    const valuations: readonly PointValuation[] = POINT_VALUATIONS.map(
      (localValuation) => {
        const databaseId = LOCAL_TO_DATABASE_ID[localValuation.id];
        const databaseValuation = databaseValuations.find(
          (valuation) => valuation.currencyCode === databaseId,
        );

        if (!databaseValuation) {
          return localValuation;
        }

        return {
          ...localValuation,
          name: databaseValuation.programName,
          cpp: Number(databaseValuation.centsPerPoint),
          sourceName: databaseValuation.source,
          sourceUrl:
            databaseValuation.sourceUrl ?? localValuation.sourceUrl,
          updatedAt: databaseValuation.validMonth,
        };
      },
    );

    const transferPartners: TransferPartner[] = databaseTransfers.flatMap(
      (transfer) => {
        const destinationProgramId =
          DATABASE_TO_LOCAL_ID[transfer.toCurrencyCode];

        if (!destinationProgramId) {
          return [];
        }

        return [
          {
            sourceProgramId: request.programId,
            destinationProgramId,
            transferRatio: Number(transfer.ratio),
            bonusPercent: isActiveBonus(transfer.bonusExpiresAt)
              ? Number(transfer.bonusPct)
              : 0,
            bonusEndsAt: transfer.bonusExpiresAt ?? undefined,
            source: "supabase" as const,
          },
        ];
      },
    );

    if (selectedProgram.transferable && transferPartners.length === 0) {
      return optimizePoints(request);
    }

    return optimizePoints(request, {
      valuations,
      transferPartners,
      transferDataSource: "supabase",
    });
  } catch {
    return optimizePoints(request, {
      valuations: POINT_VALUATIONS,
      transferPartners: LOCAL_TRANSFER_PARTNERS,
      transferDataSource: "local-fallback",
    });
  }
}
