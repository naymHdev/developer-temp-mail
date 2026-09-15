import { NextRequest, NextResponse } from "next/server";
import {
  extractClientIp,
  extractGeoLocation,
  parseUserAgent,
  recordVisitorHeartbeat,
  VisitorData,
} from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const visitorId = body.visitorId || `anon_${Math.random().toString(36).substring(2, 10)}`;

    const headers = req.headers;
    const ipAddress = extractClientIp(headers);
    const geo = extractGeoLocation(headers);
    const uaString = headers.get("user-agent");
    const { browser, os, device } = parseUserAgent(uaString);

    const visitorData: VisitorData = {
      visitorId,
      ipAddress,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
      region: geo.region,
      browser,
      os,
      device,
      screenResolution: body.screenResolution,
      language: body.language || headers.get("accept-language")?.split(",")[0],
      timezone: body.timezone,
      userAgent: uaString || undefined,
      action: body.action,
    };

    const activeUsersCount = await recordVisitorHeartbeat(visitorData);

    return NextResponse.json({
      success: true,
      activeUsersCount,
      visitorId,
      geo: {
        country: geo.country,
        countryCode: geo.countryCode,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Heartbeat error",
        activeUsersCount: 1,
      },
      { status: 500 }
    );
  }
}
