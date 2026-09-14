import { NextRequest, NextResponse } from "next/server";
import { generateNewMailbox, MailTmError } from "@/lib/mailtm";
import { saveSessionMailbox } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let customPrefix: string | undefined;

    try {
      const body = await req.json();
      if (body && typeof body.prefix === "string" && body.prefix.trim()) {
        customPrefix = body.prefix.trim();
      }
    } catch {
      // Body is optional
    }

    const { address, token, accountId } = await generateNewMailbox(customPrefix);

    const sessionId = `dtm_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    await saveSessionMailbox({
      sessionId,
      address,
      token,
      accountId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      mailbox: {
        sessionId,
        address,
        token,
        accountId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof MailTmError && error.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          isRateLimited: true,
          retryAfter: error.retryAfter || 30,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create mailbox",
      },
      { status: 500 }
    );
  }
}
