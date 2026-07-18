import { cards } from "@/lib/cards";

// GET /api/cards — the full demo card set, for frontend display.
export async function GET() {
  return Response.json({ cards });
}
