import { NextResponse } from "next/server";
import { getLiveTelemetryStats } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getLiveTelemetryStats();
    return NextResponse.json({
      success: true,
      stats,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get telemetry stats",
      },
      { status: 500 }
    );
  }
}
