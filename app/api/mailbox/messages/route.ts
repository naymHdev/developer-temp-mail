import { NextRequest, NextResponse } from "next/server";
import { getSessionMailbox } from "@/lib/session";
import { getMessages } from "@/lib/mailtm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionMailbox();

    if (!session?.token) {
      return NextResponse.json(
        { error: "No active mailbox session found", messages: [], total: 0 },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const { messages, total } = await getMessages(session.token, isNaN(page) ? 1 : page);

    return NextResponse.json({
      messages,
      total,
      address: session.address,
    });
  } catch (error) {
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
