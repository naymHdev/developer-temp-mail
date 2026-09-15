import { NextRequest, NextResponse } from "next/server";
import { getHistoricalTelemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range");
    const range: "7d" | "30d" | "24h" =
      rangeParam === "30d" ? "30d" : rangeParam === "24h" ? "24h" : "7d";

    const data = await getHistoricalTelemetry(range);

    return NextResponse.json({
      success: true,
      data,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch telemetry history",
      },
      { status: 500 }
    );
  }
}
