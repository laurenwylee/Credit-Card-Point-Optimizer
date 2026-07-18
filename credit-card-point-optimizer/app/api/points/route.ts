import { optimizePoints } from "@/lib/points/optimizer";
import type { PointsCalculationRequest } from "@/lib/points/types";
import { POINT_VALUATIONS } from "@/lib/points/valuations";

export function GET() {
  return Response.json({
    programs: POINT_VALUATIONS,
    transferDataSource: "local-fallback",
  });
}

export async function POST(request: Request) {
  let body: Partial<PointsCalculationRequest>;

  try {
    body = (await request.json()) as Partial<PointsCalculationRequest>;
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (typeof body.programId !== "string" || body.programId.length === 0) {
    return Response.json(
      { error: "Choose a rewards program." },
      { status: 400 },
    );
  }

  if (
    typeof body.points !== "number" ||
    !Number.isSafeInteger(body.points) ||
    body.points <= 0
  ) {
    return Response.json(
      { error: "Points must be a positive whole number." },
      { status: 400 },
    );
  }

  try {
    return Response.json(
      optimizePoints({
        programId: body.programId,
        points: body.points,
      }),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate point values.",
      },
      { status: 400 },
    );
  }
}
