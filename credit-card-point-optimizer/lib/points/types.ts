export type ProgramKind = "bank" | "airline" | "hotel";

export type PointValuation = {
  id: string;
  name: string;
  issuer: string;
  kind: ProgramKind;
  cpp: number;
  sourceName: string;
  sourceUrl: string;
  updatedAt: string;
  transferable: boolean;
};

export type TransferDataSource = "local-fallback";

export type TransferPartner = {
  sourceProgramId: string;
  destinationProgramId: string;
  transferRatio: number;
  bonusPercent: number;
  bonusEndsAt?: string;
  source: TransferDataSource;
};

export type PointsCalculationRequest = {
  programId: string;
  points: number;
};

export type RankedRedemptionOption = {
  id: string;
  name: string;
  type: "direct" | "transfer";
  destinationProgramId?: string;
  transferRatio: number;
  bonusPercent: number;
  destinationPoints: number;
  cpp: number;
  estimatedValueUsd: number;
  closeCall: boolean;
};

export type PointsCalculationResponse = {
  programId: string;
  programName: string;
  programKind: ProgramKind;
  transferable: boolean;
  points: number;
  baselineValueUsd: number;
  topOptions: RankedRedemptionOption[];
  recommendation: string;
  valuationUpdatedAt: string;
  transferDataSource: TransferDataSource | "not-applicable";
  disclaimer: string;
};

export type PointsApiError = {
  error: string;
};
