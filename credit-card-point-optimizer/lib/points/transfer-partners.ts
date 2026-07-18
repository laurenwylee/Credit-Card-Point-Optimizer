import type { TransferPartner } from "./types";

const partner = (
  sourceProgramId: string,
  destinationProgramId: string,
  transferRatio = 1,
  bonusPercent = 0,
): TransferPartner => ({
  sourceProgramId,
  destinationProgramId,
  transferRatio,
  bonusPercent,
  source: "local-fallback",
});

/**
 * Manually maintained transfer snapshot for the demo. Ratios and promotional
 * bonuses should be reviewed before production use. Zero bonuses are deliberate
 * so expired promotions never remain active accidentally.
 */
export const LOCAL_TRANSFER_PARTNERS: readonly TransferPartner[] = [
  partner("chase-ultimate-rewards", "air-canada-aeroplan"),
  partner("chase-ultimate-rewards", "british-airways-avios"),
  partner("chase-ultimate-rewards", "flying-blue"),
  partner("chase-ultimate-rewards", "virgin-atlantic-flying-club"),
  partner("chase-ultimate-rewards", "united-mileageplus"),
  partner("chase-ultimate-rewards", "world-of-hyatt"),
  partner("chase-ultimate-rewards", "marriott-bonvoy"),
  partner("chase-ultimate-rewards", "ihg-one-rewards"),

  partner("amex-membership-rewards", "air-canada-aeroplan"),
  partner("amex-membership-rewards", "british-airways-avios"),
  partner("amex-membership-rewards", "flying-blue"),
  partner("amex-membership-rewards", "singapore-krisflyer"),
  partner("amex-membership-rewards", "virgin-atlantic-flying-club"),
  partner("amex-membership-rewards", "marriott-bonvoy"),
  partner("amex-membership-rewards", "hilton-honors", 2),

  partner("citi-thankyou-points", "flying-blue"),
  partner("citi-thankyou-points", "singapore-krisflyer"),
  partner("citi-thankyou-points", "virgin-atlantic-flying-club"),
  partner("citi-thankyou-points", "jetblue-trueblue"),
  partner("citi-thankyou-points", "choice-privileges", 2),

  partner("capital-one-miles", "air-canada-aeroplan"),
  partner("capital-one-miles", "british-airways-avios"),
  partner("capital-one-miles", "flying-blue"),
  partner("capital-one-miles", "singapore-krisflyer"),
  partner("capital-one-miles", "virgin-atlantic-flying-club"),
  partner("capital-one-miles", "choice-privileges"),
  partner("capital-one-miles", "wyndham-rewards"),
];

export function getLocalTransferPartners(
  programId: string,
): readonly TransferPartner[] {
  return LOCAL_TRANSFER_PARTNERS.filter(
    (transfer) => transfer.sourceProgramId === programId,
  );
}
