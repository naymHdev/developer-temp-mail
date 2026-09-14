import { NextRequest, NextResponse } from "next/server";
import { saveSessionMailbox } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.address || !body.token) {
      return NextResponse.json(
        { success: false, error: "Invalid mailbox session data" },
        { status: 400 }
      );
    }

    const sessionId = body.sessionId || `dtm_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    await saveSessionMailbox({
      sessionId,
      address: body.address,
      token: body.token,
      accountId: body.accountId || "",
      createdAt: body.createdAt || new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save session",
      },
      { status: 500 }
    );
  }
}
