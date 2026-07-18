import type { Metadata } from "next";

import { optimizePoints } from "@/lib/points/optimizer";
import { POINT_VALUATIONS } from "@/lib/points/valuations";

import PointsOptimizer from "./PointsOptimizer";

export const metadata: Metadata = {
  title: "Points Redemption Optimizer",
  description:
    "Compare direct redemption estimates with eligible airline and hotel transfers.",
};

export default function PointsPage() {
  const initialResult = optimizePoints({
    programId: "chase-ultimate-rewards",
    points: 60_000,
  });

  return (
    <PointsOptimizer
      initialResult={initialResult}
      programs={POINT_VALUATIONS}
    />
  );
}
