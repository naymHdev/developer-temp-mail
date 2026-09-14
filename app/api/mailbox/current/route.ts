import { NextResponse } from "next/server";
import { getSessionMailbox } from "@/lib/session";
import { getAccountMe } from "@/lib/mailtm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionMailbox();

    if (!session) {
      return NextResponse.json({ mailbox: null }, { status: 200 });
    }

    // Verify token validity with Mail.tm
    try {
      const account = await getAccountMe(session.token);
      return NextResponse.json({
        mailbox: {
          address: account.address,
          accountId: account.id,
          createdAt: account.createdAt,
          quota: account.quota,
          used: account.used,
          sessionId: session.sessionId,
        },
      });
    } catch {
      // If token is invalid or account expired, return null so client creates new
      return NextResponse.json({ mailbox: null }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load current mailbox" },
      { status: 500 }
    );
  }
}
