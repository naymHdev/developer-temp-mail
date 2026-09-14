import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let upstreamStatus = "operational";
  let latency = 120;

  const apiUrl = (
    process.env.NEXT_PUBLIC_MAILTM_API_URL || "https://dtmail-proxy.naymhossen09.workers.dev"
  ).replace(/\/+$/, "");

  try {
    const checkRes = await fetch(`${apiUrl}/domains`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    latency = Date.now() - startTime;
    if (!checkRes.ok) {
      upstreamStatus = "degraded";
    }
  } catch {
    upstreamStatus = "degraded";
    latency = 350;
  }

  // Base day telemetry simulation based on current date
  const now = new Date();
  const daySeed = now.getUTCDate() * 100 + now.getUTCMonth();
  const hourOfDay = now.getUTCHours();

  const dailyVisits = 4280 + (daySeed % 1200) + hourOfDay * 140;
  const apiHits = 18450 + (daySeed % 3500) + hourOfDay * 680;
  const totalEmailsReceived = 9820 + (daySeed % 2100) + hourOfDay * 390;
  const activeMailboxes = 840 + (daySeed % 180) + (hourOfDay % 8) * 45;

  // 24-hour activity distribution percentages across time zones
  // Simulating typical developer peak hours (UTC, EST, GMT, BST, JST)
  const hourlyActivity = [
    { hour: "00:00", visits: 120, emails: 45, api: 210 },
    { hour: "01:00", visits: 95, emails: 30, api: 180 },
    { hour: "02:00", visits: 80, emails: 25, api: 140 },
    { hour: "03:00", visits: 110, emails: 38, api: 195 },
    { hour: "04:00", visits: 160, emails: 70, api: 310 },
    { hour: "05:00", visits: 220, emails: 110, api: 480 },
    { hour: "06:00", visits: 310, emails: 175, api: 690 },
    { hour: "07:00", visits: 450, emails: 260, api: 980 },
    { hour: "08:00", visits: 620, emails: 380, api: 1420 },
    { hour: "09:00", visits: 780, emails: 510, api: 1890 },
    { hour: "10:00", visits: 890, emails: 630, api: 2240 },
    { hour: "11:00", visits: 940, emails: 690, api: 2410 },
    { hour: "12:00", visits: 980, emails: 740, api: 2580 },
    { hour: "13:00", visits: 1050, emails: 810, api: 2840 },
    { hour: "14:00", visits: 1180, emails: 920, api: 3190 }, // Peak UTC / US East Morning + EU Afternoon
    { hour: "15:00", visits: 1240, emails: 970, api: 3410 }, // Global Max Peak
    { hour: "16:00", visits: 1190, emails: 930, api: 3260 },
    { hour: "17:00", visits: 1080, emails: 840, api: 2980 },
    { hour: "18:00", visits: 950, emails: 720, api: 2510 },
    { hour: "19:00", visits: 810, emails: 590, api: 2090 },
    { hour: "20:00", visits: 670, emails: 470, api: 1640 },
    { hour: "21:00", visits: 490, emails: 320, api: 1120 },
    { hour: "22:00", visits: 340, emails: 210, api: 780 },
    { hour: "23:00", visits: 210, emails: 115, api: 430 },
  ];

  const zonePeaks = [
    { zone: "UTC", peakHour: "14:00 - 17:00", intensity: "Very High", percentage: 38 },
    { zone: "EST (US East)", peakHour: "09:00 - 13:00", intensity: "High", percentage: 32 },
    { zone: "BST / CET (Europe)", peakHour: "10:00 - 15:00", intensity: "High", percentage: 21 },
    { zone: "JST / AEST (Asia-Pacific)", peakHour: "04:00 - 08:00", intensity: "Moderate", percentage: 9 },
  ];

  return NextResponse.json({
    health: {
      status: upstreamStatus,
      latencyMs: latency,
      uptimePercentage: 99.98,
      lastChecked: new Date().toISOString(),
      provider: "Mail.tm Serverless Node",
    },
    metrics: {
      dailyVisits,
      apiHits,
      totalEmailsReceived,
      activeMailboxes,
    },
    activity: {
      hourly: hourlyActivity,
      zonePeaks,
    },
  });
}
