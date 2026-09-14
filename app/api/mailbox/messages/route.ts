import { NextRequest, NextResponse } from "next/server";
import { getSessionMailbox } from "@/lib/session";
import { getMessages, MailTmError } from "@/lib/mailtm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let token: string | null = null;
    let address: string | null = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      const session = await getSessionMailbox();
      if (session?.token) {
        token = session.token;
        address = session.address;
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "No active mailbox token provided", messages: [], total: 0 },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const { messages, total } = await getMessages(token, isNaN(page) ? 1 : page);

    return NextResponse.json({
      messages,
      total,
      address,
    });
  } catch (error) {
    if (error instanceof MailTmError && error.status === 429) {
      return NextResponse.json(
        {
          error: error.message,
          isRateLimited: true,
          retryAfter: error.retryAfter || 30,
          messages: [],
          total: 0,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch messages",
        messages: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
